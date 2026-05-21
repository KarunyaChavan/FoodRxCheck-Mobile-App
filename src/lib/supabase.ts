/** FoodRxCheck Mobile App
 * Production source file. Keep logic typed, documented, and lint-clean.*/

/**
 * @file Configures the Supabase client used by auth and data-access code.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gxrqpnlluwibbmqwkgha.supabase.co';
const supabaseAnonKey =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4cnFwbmxsdXdpYmJtcXdrZ2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMjMzNzAsImV4cCI6MjA1MDc5OTM3MH0.BqSZka8wA0LU0vf9wxVqPMlVacpzmnhOzdns1PxTCQo';

 const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
export default supabase;
