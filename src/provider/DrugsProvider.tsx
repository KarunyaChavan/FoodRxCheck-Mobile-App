/**
 * @file Stores selected drugs for cross-screen interaction comparison.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useAuth } from './AuthProvider';

type Drug = {
  drug_id: number;
  drug_name: string;
};

type DrugsContextType = {
  selectedDrugs: Drug[];
  onAddDrug: (drug: Drug) => void;
  onRemoveDrug: (drugId: number) => void;
};

const DrugsContext = createContext<DrugsContextType | undefined>(undefined);

/**
 * Persists selected drugs and exposes helpers for interaction comparisons.
 */
const DrugsProvider = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);

  const userId = user?.id || 'anonymous';

  useEffect(() => {
    const loadDrugs = async () => {
      try {
        // Load selected drugs from AsyncStorage for the specific user
        const savedDrugs = await AsyncStorage.getItem(`selectedDrugs_${userId}`);
        if (savedDrugs) {
          setSelectedDrugs(JSON.parse(savedDrugs));
        }
      } catch (error) {
        console.error('Error loading selected drugs:', error);
      }
    };

    loadDrugs();
  }, [userId]);

  /**
   * Adds a drug to the selected-drug list if it is not already present.
   */
  const onAddDrug = (drug: Drug) => {
    setSelectedDrugs((prev) => {
      if (!prev.some((d) => d.drug_id === drug.drug_id)) {
        const updatedDrugs = [...prev, drug];
        // Save the updated list to AsyncStorage
        AsyncStorage.setItem(`selectedDrugs_${userId}`, JSON.stringify(updatedDrugs));
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
      // Save the updated list to AsyncStorage
      AsyncStorage.setItem(`selectedDrugs_${userId}`, JSON.stringify(updatedDrugs));
      return updatedDrugs;
    });
  };

  return (
    <DrugsContext.Provider value={{ selectedDrugs, onAddDrug, onRemoveDrug }}>
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
