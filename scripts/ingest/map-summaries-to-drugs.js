#!/usr/bin/env node
/**
 * Map `external_summaries` rows to `drugs` using fuzzy matching and synonyms.
 * Replaces older/duplicated mapping logic with a single, well-tested script.
 * Reads credentials from .env using the exact variable names in the repository.
 * Usage: `node scripts/ingest/map-summaries-to-drugs.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const { createSupabaseClient } = require('./utils/supabase-client');

const supabase = createSupabaseClient();

/* Helpers */
function normalize(s) {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/["'()\[\],.:;\/\\\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  if (!a || !b) return (a || b) ? Math.max(a.length, b.length) : 0;
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function similarity(a, b) {
  const A = normalize(a);
  const B = normalize(b);
  if (!A && !B) return 1;
  if (!A || !B) return 0;
  if (A === B) return 1;
  const dist = levenshtein(A, B);
  const maxLen = Math.max(A.length, B.length);
  return 1 - dist / maxLen;
}

async function mapOnce({ limit = 500, threshold = 0.85 } = {}) {
  const { data: rows, error: rerr } = await supabase
    .from('external_summaries')
    .select('id,drug_name,summary')
    .is('supabase_drug_id', null)
    .limit(limit);
  if (rerr) throw rerr;
  if (!rows || rows.length === 0) {
    logger.info('No unmapped external_summaries found.');
    return;
  }

  const { data: drugs } = await supabase.from('drugs').select('drug_id,drug_name');
  const { data: syns } = await supabase.from('drug_synonyms').select('drug_name,synonym');

  const drugList = (drugs || []).map((d) => ({ id: d.drug_id, name: d.drug_name, norm: normalize(d.drug_name) }));
  const synMap = new Map();
  (syns || []).forEach((s) => {
    const key = normalize(s.synonym);
    if (!synMap.has(key)) synMap.set(key, []);
    synMap.get(key).push(s.drug_name);
  });

  for (const row of rows) {
    const normName = normalize(row.drug_name);
    let best = { score: 0, drugId: null, drugName: null, reason: null };

    // exact normalized match
    for (const d of drugList) {
      if (d.norm === normName) {
        best = { score: 1, drugId: d.id, drugName: d.name, reason: 'exact' };
        break;
      }
    }

    // synonyms exact
    if (best.score < 1 && synMap.has(normName)) {
      const mapped = synMap.get(normName)[0];
      const d = drugList.find((x) => x.name === mapped);
      if (d) best = { score: 0.98, drugId: d.id, drugName: d.name, reason: 'synonym-exact' };
    }

    // fuzzy against drug names
    if (best.score < 0.98) {
      for (const d of drugList) {
        const s = similarity(normName, d.norm);
        if (s > best.score) best = { score: s, drugId: d.id, drugName: d.name, reason: 'fuzzy-name' };
      }
    }

    // use generic/brand names from summary
    if (row.summary) {
      const summ = row.summary;
      const candidates = [];
      if (Array.isArray(summ.genericNames)) candidates.push(...summ.genericNames);
      if (Array.isArray(summ.brandNames)) candidates.push(...summ.brandNames);
      for (const cand of candidates) {
        const candNorm = normalize(cand);
        if (synMap.has(candNorm)) {
          const mapped = synMap.get(candNorm)[0];
          const d = drugList.find((x) => x.name === mapped);
          if (d && 0.99 > best.score) best = { score: 0.99, drugId: d.id, drugName: d.name, reason: 'summary-synonym' };
        }
        for (const d of drugList) {
          const s = similarity(candNorm, d.norm);
          if (s > best.score) best = { score: s, drugId: d.id, drugName: d.name, reason: 'summary-fuzzy' };
        }
      }
    }

    if (best.drugId && best.score >= threshold) {
      const { error: upErr } = await supabase
        .from('external_summaries')
        .update({ supabase_drug_id: best.drugId, confidence: best.score })
        .eq('id', row.id);
      if (upErr) logger.error('Failed update', row.id, upErr.message || upErr);
      else logger.info('Mapped %s -> %s (%s) score=%s %s', row.drug_name, best.drugId, best.drugName, best.score.toFixed(3), best.reason);
    } else {
      logger.info('No confident match for %s bestScore=%s candidate=%s', row.drug_name, best.score.toFixed(3), best.drugName || 'none');
    }
  }
}

mapOnce().catch((err) => {
  logger.error('Mapping run failed %o', err);
  process.exit(1);
});
