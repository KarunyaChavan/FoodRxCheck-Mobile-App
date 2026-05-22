/** FoodRxCheck Mobile App
 * Production source file. Keep logic typed, documented, and lint-clean.*/

/**
 * @file Configures the Supabase client used by auth and data-access code.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { env } from '../config/env';

const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;
