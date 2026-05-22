/**
 * @file Service layer for drug database suggestions and user feedback forms.
 */

import supabase from '../../lib/supabase-service';

type SuggestionPayload = {
  name?: string | null;
  role?: string | null;
  query: string;
  description: string;
};

/**
 * Submits a new drug suggestion to the database.
 * @param payload Suggestion attributes including query type and descriptions.
 */
export const submitSuggestion = async (payload: SuggestionPayload): Promise<void> => {
  const { error } = await supabase
    .from('suggestions')
    .insert([payload]);

  if (error) {
    throw new Error(error.message);
  }
};
