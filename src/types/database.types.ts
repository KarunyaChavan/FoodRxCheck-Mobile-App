/**
 * @file TypeScript interfaces for Supabase database tables and application data models.
 * Follows strict coding standards and provides high structural type-safety.
 */

export interface UserProfile {
  id: string;
  updated_at?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  role?: 'hcp' | 'patient' | 'admin';
  qualification?: string;
}

export interface DrugClass {
  class_id: number;
  class_name: string;
}

export interface SubClass {
  subclass_id: number;
  name: string;
  class_id: number;
}

export interface Drug {
  drug_id: number;
  drug_name: string;
  class_id?: number;
  subclass_id?: number;
}

export interface PatientDrug {
  id: number;
  drug_name: string;
}

export interface GeneralInstruction {
  id: number;
  drug: string;
  instructions?: string;
  references?: string;
  image_path?: string;
}

export interface InteractionBase {
  food: string;
  management?: string;
  counselling_tips?: string;
  mechanism_of_action?: string;
  severity?: string;
  reference?: string;
}

export interface Interaction extends InteractionBase {
  drug_id: string | number;
  isCounsellingTips?: boolean;
}

export interface DrugSuggestion {
  id?: number;
  created_at?: string;
  user_id?: string;
  drug_name: string;
  description: string;
  status?: string;
}
