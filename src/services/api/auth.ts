/**
 * @file Service layer for user authentication and profiles queries.
 * Adheres strictly to SOLID design principles.
 */

import supabase from '../../lib/supabase';
import { UserProfile } from '../../types/database.types';

/**
 * Fetches user profile record by ID.
 * @param userId Unique user authentication ID.
 */
export const fetchProfile = async (userId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
