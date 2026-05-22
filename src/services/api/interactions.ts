/**
 * @file Service layer for food-drug interaction queries and comparison logic.
 */

import supabase from '../../lib/supabase-service';
import { Interaction, Drug } from '../../types/database.types';

/**
 * Fetches all food interactions for a specific drug ID.
 * @param drugId Target drug identifier.
 * @param isHcp Boolean flag indicating if clinical HCP details are requested.
 */
export const fetchDrugInteractions = async (
  drugId: string | number,
  isHcp: boolean,
): Promise<Interaction[]> => {
  const tableName = isHcp ? 'interactions' : 'patient_interactions';
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('drug_id', drugId);

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Executes a two-step query to find drugs that interact with a specific food query.
 * Matches keywords using full text or ilike, then resolves drug names.
 * @param food Target food name (e.g. 'Grapefruit', 'Tea').
 * @param isHcp Boolean flag indicating if clinical HCP details are requested.
 */
export const fetchDrugsByFood = async (
  food: string,
  isHcp: boolean,
): Promise<Drug[]> => {
  if (!food.trim()) {
    return [];
  }

  const interactionsTable = isHcp ? 'interactions' : 'patient_interactions';
  const drugsTable = isHcp ? 'drugs' : 'patient_drugs';

  const { data: interactions, error: interactionsError } = await supabase
    .from(interactionsTable)
    .select('drug_id')
    .ilike('food', `%${food.toLowerCase()}%`);

  if (interactionsError) {
    console.error('Error fetching interactions:', interactionsError);
    throw new Error(interactionsError.message);
  }

  const drugIds = interactions.map((interaction) => interaction.drug_id);
  if (drugIds.length === 0) {
    return [];
  }

  const { data: drugs, error: drugsError } = await supabase
    .from(drugsTable)
    .select('drug_id, drug_name')
    .in('drug_id', drugIds);

  if (drugsError) {
    console.error('Error fetching drugs:', drugsError);
    throw new Error(drugsError.message);
  }

  return drugs || [];
};
