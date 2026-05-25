/**
 * @file Shared Supabase client factory for ingestion scripts.
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');
const { loadProjectEnv } = require('./load-env');

function createSupabaseClient() {
  loadProjectEnv();

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.EXPO_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase env vars: EXPO_PUBLIC_SUPABASE_URL and EXPO_SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, key);
}

module.exports = { createSupabaseClient };