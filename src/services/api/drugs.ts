/**
 * @file Service layer for drug catalog, classification, and general instructions database queries.
 */

import supabase from '../../lib/supabase-service';
import {
  DrugClass,
  SubClass,
  Drug,
  PatientDrug,
  GeneralInstruction,
} from '../../types/database.types';

/**
 * Fetches all drug classes ordered alphabetically.
 */
export const fetchClasses = async (): Promise<DrugClass[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('class_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Fetches all sub-classes for a parent class.
 * @param classId Parent class ID.
 */
export const fetchSubClasses = async (classId: string | number): Promise<SubClass[]> => {
  const { data, error } = await supabase
    .from('sub_classes')
    .select('*')
    .eq('class_id', classId)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Fetches drugs belonging directly to a class ID.
 * @param classId Target class ID.
 */
export const fetchClassDrugs = async (classId: string | number): Promise<Drug[]> => {
  const { data, error } = await supabase
    .from('drugs')
    .select('*')
    .eq('class_id', classId)
    .order('drug_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Fetches drugs belonging to a sub-class ID.
 * @param subClassId Target sub-class ID.
 */
export const fetchSubClassDrugs = async (subClassId: string | number): Promise<Drug[]> => {
  const { data, error } = await supabase
    .from('drugs')
    .select('*')
    .eq('subclass_id', subClassId)
    .order('drug_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Fetches one paginated slice of the HCP drugs catalog.
 * @param offset Row index to start fetching.
 * @param limit Total rows count to fetch.
 */
export const fetchPaginatedDrugs = async (offset: number, limit: number): Promise<Drug[]> => {
  const { data, error } = await supabase
    .from('drugs')
    .select('*')
    .order('drug_name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Fetches one paginated slice of the Patient drugs catalog.
 * @param offset Row index to start fetching.
 * @param limit Total rows count to fetch.
 */
export const fetchPaginatedPatientDrugs = async (
  offset: number,
  limit: number,
): Promise<PatientDrug[]> => {
  const { data, error } = await supabase
    .from('patient_drugs')
    .select('*')
    .order('drug_name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Fetches all general instructions names and ids.
 */
export const fetchAllGeneralInstructions = async (): Promise<GeneralInstruction[]> => {
  const { data, error } = await supabase
    .from('general_instructions')
    .select('id,drug')
    .order('drug', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

/**
 * Fetches a single general instruction detail.
 * @param id General instruction ID.
 */
export const fetchGeneralInstructionDetail = async (
  id: string | number,
): Promise<GeneralInstruction> => {
  const { data, error } = await supabase
    .from('general_instructions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data;
};
