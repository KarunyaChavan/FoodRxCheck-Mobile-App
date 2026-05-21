/**
 * @file Centralized factory for React Query keys.
 */

export const queryKeys = {
  drugs: {
    all: ['drugs'] as const,
    paginated: (offset: number, limit: number) => ['drugs', 'paginated', offset, limit] as const,
    patientPaginated: (offset: number, limit: number) => ['patient_drugs', 'paginated', offset, limit] as const,
    search: (searchTerm: string, isHcp: boolean) => ['searchDrugs', searchTerm, isHcp] as const,
    bySubClass: (subClassId: string | number) => ['drugs', 'bySubClass', subClassId] as const,
    byClass: (classId: string | number) => ['drugs', 'byClass', classId] as const,
  },
  classes: {
    all: ['classes'] as const,
    subClasses: (classId: string | number) => ['sub_classes', classId] as const,
  },
  interactions: {
    byDrug: (drugId: string | number, isHcp: boolean) => ['interactions', 'byDrug', drugId, isHcp] as const,
    selected: (userId: string) => ['selectedinteractions', userId] as const,
  },
  instructions: {
    all: ['general_instructions'] as const,
    byDrug: (drugId: string | number) => ['instructions', drugId] as const,
  },
};
