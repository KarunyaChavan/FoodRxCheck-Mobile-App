import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from "./AuthProvider";

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

const DrugsProvider = ({ children }: PropsWithChildren) => {
    const {user} = useAuth();
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
        console.error("Error loading selected drugs:", error);
      }
    };

    loadDrugs();
  }, [userId]);

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

export const useDrugs = () => {
  const context = useContext(DrugsContext);
  if (!context) {
    throw new Error("useDrugs must be used within a DrugsProvider");
  }
  return context;
};
