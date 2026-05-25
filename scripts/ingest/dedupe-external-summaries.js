#!/usr/bin/env node
/**
 * Dedupe external_summaries by (lower(drug_name), source_id).
 * Backups duplicates to a local JSON file before deleting older rows.
 * Keeps the newest row (by fetched_at) per group.
 */

const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const { createSupabaseClient } = require('./utils/supabase-client');

const supabase = createSupabaseClient();

async function run() {
  logger.info('Discovering duplicate groups...');
  // Fetch all and detect duplicates client-side
  const { data: all } = await supabase.from('external_summaries').select('id,drug_name,source_id,fetched_at').limit(5000);
  const map = new Map();
  for (const r of all || []) {
    const key = `${(r.drug_name || '').toLowerCase()}::${r.source_id}`;
    map.set(key, (map.get(key) || []).concat(r));
  }
  const dupKeys = [];
  for (const [k, arr] of map.entries()) if (arr.length > 1) dupKeys.push(k);

  if (dupKeys.length === 0) {
    logger.info('No duplicates found.');
    return;
  }

  logger.info('Found %d duplicate groups — backing up and deleting older rows.', dupKeys.length);
  const backup = [];
  const toDeleteIds = [];

  for (const key of dupKeys) {
    const [nameLower, sourceId] = key.split('::');
    const rows = map.get(key).sort((a, b) => new Date(b.fetched_at) - new Date(a.fetched_at));
    const keep = rows[0];
    const deletes = rows.slice(1);
    backup.push(...deletes);
    toDeleteIds.push(...deletes.map((d) => d.id));
    logger.info('Group %s (%s): keeping %s, deleting %d rows', nameLower, sourceId, keep.id, deletes.length);
  }

  if (backup.length === 0) {
    logger.info('No rows to delete after analysis.');
    return;
  }

  const outPath = path.resolve(process.cwd(), `scripts/ingest/external_summaries_duplicates_backup_${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(backup, null, 2), 'utf8');
  logger.info('Backup written to %s', outPath);

  // Delete rows in chunks
  for (let i = 0; i < toDeleteIds.length; i += 100) {
    const chunk = toDeleteIds.slice(i, i + 100);
    const { error } = await supabase.from('external_summaries').delete().in('id', chunk);
    if (error) logger.error('Failed to delete chunk %o', error.message || error);
    else logger.info('Deleted %d rows', chunk.length);
  }

  logger.info('Deduplication complete.');
}

run().catch((err) => {
  logger.error('Dedupe run failed %o', err);
  process.exit(1);
});
