/**
 * @file Stores selected drugs for cross-screen interaction comparison.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthProvider';

type Drug = {
  drug_id: number;
  drug_name: string;
  schedules?: string[];
};

type AdherenceLog = Record<number, string[]>;

type DrugsContextType = {
  selectedDrugs: Drug[];
  adherenceLogs: AdherenceLog;
  onAddDrug: (drug: Drug) => void;
  onRemoveDrug: (drugId: number) => void;
  onUpdateSchedule: (drugId: number, schedules: string[]) => void;
  onLogDose: (drugId: number) => void;
};

const DrugsContext = createContext<DrugsContextType | undefined>(undefined);

const buildStorageKey = (key: 'selectedDrugs' | 'adherenceLogs', userId: string) =>
  `${key}_${userId}`;

/**
 * Persists a JSON-serializable value in AsyncStorage.
 */
const saveJson = (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value));

/**
 * Reads and parses a JSON value from AsyncStorage.
 */
const loadJson = async <T,>(key: string): Promise<T | null> => {
  const rawValue = await AsyncStorage.getItem(key);
  return rawValue ? (JSON.parse(rawValue) as T) : null;
};

/**
 * Persists selected drugs and exposes helpers for interaction comparisons.
 */
const DrugsProvider = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [adherenceLogs, setAdherenceLogs] = useState<AdherenceLog>({});

  const userId = user?.id || 'anonymous';
  const selectedDrugsStorageKey = buildStorageKey('selectedDrugs', userId);
  const adherenceLogsStorageKey = buildStorageKey('adherenceLogs', userId);

  useEffect(() => {
    const loadDrugs = async () => {
      try {
        const savedDrugs = await loadJson<Drug[]>(selectedDrugsStorageKey);
        if (savedDrugs) {
          setSelectedDrugs(savedDrugs);
        }

        const savedLogs = await loadJson<AdherenceLog>(adherenceLogsStorageKey);
        if (savedLogs) {
          setAdherenceLogs(savedLogs);
        }
      } catch (error) {
        console.error('Error loading selected drugs or logs:', error);
      }
    };

    loadDrugs();
  }, [adherenceLogsStorageKey, selectedDrugsStorageKey]);

  /**
   * Adds a drug to the selected-drug list if it is not already present.
   */
  const onAddDrug = (drug: Drug) => {
    setSelectedDrugs((prev) => {
      if (!prev.some((d) => d.drug_id === drug.drug_id)) {
        const updatedDrugs = [...prev, drug];
        void saveJson(selectedDrugsStorageKey, updatedDrugs);
        return updatedDrugs;
      }
      return prev;
    });
  };

  /**
   * Removes a selected drug by its Supabase drug id.
   */
  const onRemoveDrug = (drugId: number) => {
    setSelectedDrugs((prev) => {
      const updatedDrugs = prev.filter((d) => d.drug_id !== drugId);
      void saveJson(selectedDrugsStorageKey, updatedDrugs);
      return updatedDrugs;
    });
  };

  /**
   * Updates the schedule for a specific drug.
   */
  const onUpdateSchedule = (drugId: number, schedules: string[]) => {
    setSelectedDrugs((prev) => {
      const updatedDrugs = prev.map((d) => (d.drug_id === drugId ? { ...d, schedules } : d));
      void saveJson(selectedDrugsStorageKey, updatedDrugs);
      return updatedDrugs;
    });
  };

  /**
   * Logs a taken dose for a specific drug today.
   */
  const onLogDose = (drugId: number) => {
    setAdherenceLogs((prev) => {
      const now = new Date().toISOString();
      const updatedLogs = { ...prev, [drugId]: [...(prev[drugId] || []), now] };
      void saveJson(adherenceLogsStorageKey, updatedLogs);
      return updatedLogs;
    });
  };

  return (
    <DrugsContext.Provider value={{ selectedDrugs, adherenceLogs, onAddDrug, onRemoveDrug, onUpdateSchedule, onLogDose }}>
      {children}
    </DrugsContext.Provider>
  );
};

export default DrugsProvider;

/**
 * Reads selected-drug state from the nearest DrugsProvider.
 */
export const useDrugs = () => {
  const context = useContext(DrugsContext);
  if (!context) {
    throw new Error('useDrugs must be used within a DrugsProvider');
  }
  return context;
};
