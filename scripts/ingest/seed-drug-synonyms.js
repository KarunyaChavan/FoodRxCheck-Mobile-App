#!/usr/bin/env node
/**
 * @file Seed `drug_synonyms` from mapped FDA summaries and existing drug names.
 *
 * This is a safe, repeatable seeder: it only inserts missing alias pairs.
 * Usage: `node scripts/ingest/seed-drug-synonyms.js`
 */

'use strict';

const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const { createSupabaseClient } = require('./utils/supabase-client');

const supabase = createSupabaseClient();

/**
 * Normalize a label so punctuation and spacing don't affect alias matching.
 * The character-class regex removes separators before whitespace collapsing.
 */
const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[\"'\[\],.:;\/\\\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const looksLikeAlias = (value) => {
  const text = String(value || '').trim();
  if (!text) return false;
  if (text.length < 2 || text.length > 60) return false;
  /** Reject comma/semicolon lists and conjunction-heavy phrases. */
  if (/[;,]/.test(text)) return false;
  if (/\b(?:and|or)\b/i.test(text)) return false;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 5) return false;
  return true;
};

const stripParenthetical = (value) => String(value || '').replace(/\s*\(([^)]+)\)\s*$/, ' $1').trim();

const flattenBrandNames = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(flattenNames);
  if (typeof value === 'string') {
    return value
      .split(/[;|\/]/g)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [String(value).trim()].filter(Boolean);
};

const flattenNames = flattenBrandNames;

const flattenGenericNames = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenGenericNames(entry));
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (!text) return [];
    if (/[;,]/.test(text) || /\b(?:and|or)\b/i.test(text)) return [];
    if (text.split(/\s+/).filter(Boolean).length > 4) return [];
    return [text];
  }

  return [String(value).trim()].filter(Boolean);
};

const addPair = (pairs, drugName, synonym) => {
  const canonical = String(drugName || '').trim();
  const alias = String(synonym || '').trim();
  if (!canonical || !alias) return;
  if (!looksLikeAlias(alias)) return;
  if (normalize(canonical) === normalize(alias)) return;
  pairs.set(`${normalize(canonical)}||${normalize(alias)}`, { drug_name: canonical, synonym: alias });
};

async function run() {
  logger.info('Loading drugs, summaries, and existing synonym rows...');

  const replaceExisting = process.argv.includes('--replace');

  const [{ data: drugs, error: drugsError }, { data: summaries, error: summariesError }, { data: existing, error: existingError }] =
    await Promise.all([
      supabase.from('drugs').select('drug_id,drug_name'),
      supabase.from('external_summaries').select('drug_name,supabase_drug_id,summary'),
      supabase.from('drug_synonyms').select('drug_name,synonym'),
    ]);

  if (drugsError) throw drugsError;
  if (summariesError) throw summariesError;
  if (existingError) throw existingError;

  if (replaceExisting) {
    logger.info('Clearing existing `drug_synonyms` rows before reseeding...');
    const { error: deleteError } = await supabase.from('drug_synonyms').delete().neq('drug_name', '__never__');
    if (deleteError) throw deleteError;
  }

  const drugById = new Map((drugs || []).map((drug) => [String(drug.drug_id), drug.drug_name]));
  const pairs = new Map();
  const seedRows = replaceExisting ? [] : (existing || []);

  for (const row of seedRows) {
    addPair(pairs, row.drug_name, row.synonym);
  }

  for (const row of summaries || []) {
    const canonical = drugById.get(String(row.supabase_drug_id)) || row.drug_name;
    const aliases = new Set();

    for (const name of flattenBrandNames(row.summary?.brandNames)) {
      if (/^[A-Z0-9-]{2,}$/.test(name.trim())) aliases.add(name.trim());
    }
    for (const name of flattenGenericNames(row.summary?.genericNames)) aliases.add(name);
    if (row.drug_name) aliases.add(row.drug_name);

    const canonicalParenthetical = stripParenthetical(row.drug_name);
    if (canonicalParenthetical && canonicalParenthetical !== row.drug_name) aliases.add(canonicalParenthetical);

    for (const alias of aliases) {
      addPair(pairs, canonical, alias);
    }

    const shortLabel = stripParenthetical(row.drug_name).replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '').trim();
    if (shortLabel && shortLabel !== row.drug_name) addPair(pairs, canonical, shortLabel);
  }

  const rows = [...pairs.values()];
  logger.info('Prepared %s synonym pairs (%s existing rows checked).', rows.length, seedRows.length);

  let inserted = 0;
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from('drug_synonyms').insert(chunk);
    if (error) throw error;
    inserted += chunk.length;
    logger.info('Inserted %s/%s rows...', inserted, rows.length);
  }

  logger.info('Seed complete: inserted %s synonym rows.', inserted);
}

run().catch((err) => {
  logger.error('Synonym seeding failed %o', err);
  process.exit(1);
});