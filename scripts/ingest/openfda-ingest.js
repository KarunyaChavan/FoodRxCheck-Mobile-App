#!/usr/bin/env node
/**
 * Simple ingestion script to fetch openFDA label summaries and upsert into Supabase.
 * Usage:
 *  - single drug: node openfda-ingest.js "aspirin"
 *  - list file: node openfda-ingest.js --file=./scripts/ingest/sample_drugs.txt
 *
 * Requires environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY
 */

const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const { createSupabaseClient } = require('./utils/supabase-client');

const supabase = createSupabaseClient();
const { buildSummaryFromRecord } = require('./utils/normalize-summary');

async function upsertSource(name, url) {
  // Try to find existing source by name
  const { data: existing } = await supabase.from('sources').select('id').eq('name', name).limit(1).maybeSingle();
  if (existing && existing.id) return existing.id;

  const { data: inserted, error: insertErr } = await supabase.from('sources').insert({ name, url }).select('id').single();
  if (insertErr) throw insertErr;
  return inserted.id;
}

async function upsertExternalSummary(drugName, sourceId, summaryObj, sourceUrl) {
  const fetchedAt = new Date().toISOString();
  // Try to find matching drug in our Supabase `drugs` table
  const { data: matchedDrug } = await supabase
    .from('drugs')
    .select('drug_id')
    .ilike('drug_name', drugName)
    .limit(1)
    .maybeSingle();
  const supabaseDrugId = matchedDrug && matchedDrug.drug_id ? matchedDrug.drug_id : null;
  // Try update first
  const { data: existing, error: fetchErr } = await supabase
    .from('external_summaries')
    .select('id')
    .eq('drug_name', drugName)
    .eq('source_id', sourceId)
    .limit(1)
    .maybeSingle();

  if (fetchErr) {
    logger.error('Fetch error for external_summaries %o', fetchErr.message || fetchErr);
    return null;
  }

  if (existing && existing.id) {
    const updateRow = { summary: summaryObj, source_url: sourceUrl, fetched_at: fetchedAt };
    if (supabaseDrugId) updateRow.supabase_drug_id = supabaseDrugId;
    const { data: updated, error: updateErr } = await supabase
      .from('external_summaries')
      .update(updateRow)
      .eq('id', existing.id)
      .select('id')
      .single();
    if (updateErr) {
      logger.error('Update error for %s %o', drugName, updateErr.message || updateErr);
      return null;
    }
    return updated.id;
  }

  // Insert if not exists
  const insertRow = { drug_name: drugName, source_id: sourceId, summary: summaryObj, source_url: sourceUrl, fetched_at: fetchedAt };
  if (supabaseDrugId) insertRow.supabase_drug_id = supabaseDrugId;
  const { data: inserted, error: insertErr } = await supabase
    .from('external_summaries')
    .insert(insertRow)
    .select('id')
    .single();

  if (insertErr) {
    logger.error('Insert error for %s %o', drugName, insertErr.message || insertErr);
    return null;
  }
  return inserted.id;
}

async function ingestDrug(drug) {
  const normalized = drug.trim();
  if (!normalized) return;
  logger.info('Fetching openFDA for: %s', normalized);
  // For name-based ingestion we expect a JSON dump to be used; fallback: log and skip
  logger.warn('ingestDrug called in file-based mode for %s — prefer using --file with JSON dump', normalized);
}

async function ingestRecord(record) {
  // Derive a primary drug name: prefer generic, then brand, then record.drug_name
  const openfda = record.openfda || {};
  const generic = Array.isArray(openfda.generic_name) ? openfda.generic_name[0] : undefined;
  const brand = Array.isArray(openfda.brand_name) ? openfda.brand_name[0] : undefined;
  const drugName = generic || brand || record.drug_name || record.drug || null;
  if (!drugName) {
    logger.warn('Skipping record without identifiable drug name');
    return;
  }

  const built = await buildSummaryFromRecord(record);
  if (!built) {
    logger.warn('No summary constructed for %s', drugName);
    return;
  }

  const sourceName = 'openfda';
  const sourceId = await upsertSource(sourceName, 'https://open.fda.gov/');
  const externalId = await upsertExternalSummary(drugName, sourceId, built.summary, built.source_url);
  logger.info('Upserted external summary id: %s for %s', externalId, drugName);
}

async function run() {
  const arg = process.argv[2];
  if (!arg) {
    logger.error('Provide a drug name, --file=path, or --from-drugs');
    process.exit(2);
  }

  if (arg === '--from-drugs') {
    // Fetch all drugs from the `drugs` table and ingest by drug_name
    const { data: drugs, error } = await supabase.from('drugs').select('drug_name').order('drug_name', { ascending: true });
    if (error) {
      logger.error('Failed to fetch drugs for bulk ingestion %o', error.message || error);
      process.exit(1);
    }
    for (const d of drugs) {
      // eslint-disable-next-line no-await-in-loop
      // This path is deprecated for file-based ingestion — skip or log
      logger.warn('--from-drugs triggered; consider preparing a JSON dump and using --file=path.json instead');
      await ingestDrug(d.drug_name || d.drug);
    }
  } else if (arg.startsWith('--file=')) {
    const filePath = arg.split('=')[1];
    const abs = path.resolve(process.cwd(), filePath);
    const content = fs.readFileSync(abs, 'utf8');
    if (filePath.endsWith('.json')) {
      let arr = [];
      try {
        arr = JSON.parse(content);
      } catch (e) {
        logger.error('Failed to parse JSON file %s %o', filePath, e);
        process.exit(1);
      }
      if (!Array.isArray(arr)) {
        logger.error('Expected an array in JSON file %s', filePath);
        process.exit(1);
      }
      for (const rec of arr) {
        // eslint-disable-next-line no-await-in-loop
        await ingestRecord(rec);
      }
    } else {
      const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      for (const line of lines) {
        // eslint-disable-next-line no-await-in-loop
        await ingestDrug(line);
      }
    }
  } else {
    await ingestDrug(arg);
  }
  logger.info('Ingestion run complete.');
}

run().catch((err) => {
  logger.error('Ingest script error %o', err);
  process.exit(1);
});
