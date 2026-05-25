#!/usr/bin/env node
/**
 * Export unmapped external_summaries (supabase_drug_id IS NULL) to a JSON file for manual review.
 */
const fs = require('fs');
const path = require('path');
const logger = require('../logger');
const { createSupabaseClient } = require('./utils/supabase-client');

const supabase = createSupabaseClient();

async function run() {
  const { data } = await supabase
    .from('external_summaries')
    .select('id,drug_name,summary,source_id,source_url,fetched_at')
    .is('supabase_drug_id', null)
    .order('fetched_at', { ascending: false });

  const outPath = path.resolve(process.cwd(), 'scripts/ingest/unmapped_external_summaries.json');
  fs.writeFileSync(outPath, JSON.stringify(data || [], null, 2), 'utf8');
  logger.info('Wrote %d unmapped rows to %s', (data || []).length, outPath);
}

run().catch((err) => {
  logger.error('Export failed %o', err);
  process.exit(1);
});
