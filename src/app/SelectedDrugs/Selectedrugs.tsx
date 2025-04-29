import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import React from 'react';
import { useDrugs } from '../../provider/DrugsProvider';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../provider/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import supabase from '../../lib/supabase';

const fetchInteractions = async (selectedDrugs: { drug_id: number; drug_name: string; }[], isHcp: boolean) => {
  const interactionsMap: { [key: number]: { count: number; interactions: string[] } } = {};

  for (const drug of selectedDrugs) {
    const { data, error } = await supabase
      .from(isHcp ? 'interactions' : 'patient_interactions')
      .select('*')
      .eq('drug_id', drug.drug_id);

    if (!error && data) {
      const validInteractions = data
        .map((item) => item.food)
        .filter((interaction) => interaction && interaction !== 'NA');

      interactionsMap[drug.drug_id] = {
        count: validInteractions.length,
        interactions: validInteractions,
      };
    }
  }

  return interactionsMap;
};

const SelectedDrugs = () => {
  const { selectedDrugs, onRemoveDrug } = useDrugs();
  const router = useRouter();
  const { isHcp,user } = useAuth();
  const keyUser = user?.id || 'patient';
  const { data: interactionData, isLoading } = useQuery({
    queryKey: ['selectedinteractions',keyUser],
    queryFn: () => fetchInteractions(selectedDrugs, isHcp),
    enabled: selectedDrugs.length > 0, 
  });

  // Clear all selected drugs
  const clearAllDrugs = () => {
    selectedDrugs.forEach((drug) => onRemoveDrug(drug.drug_id));
  };

  // Navigate to DrugInteractionList page
  const handleNavigate = (drug: { drug_id: any; drug_name: any; }) => {
    const path = isHcp
      ? '/hcp_dynamic/drug-details/[id]'
      : '/patient_dynamic/int-drugs-pt/[id]';

    router.push({
      pathname: path,
      params: { id: drug.drug_id.toString(), name: drug.drug_name },
    });
  };

  if (isLoading) {
    
    return <ActivityIndicator style={styles.loading} size="large" color="#0a7ea4" />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Selected Drugs',
          headerStyle: { backgroundColor: '#0a7ea4' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {selectedDrugs.length === 0 ? (
          <Text style={styles.emptyMessage}>No drugs selected.</Text>
        ) : (
          selectedDrugs.map((drug) => {
            const interactions = interactionData?.[drug.drug_id]?.interactions || [];
            const interactionCount = interactions.length;

            return (
              <View key={drug.drug_id} style={styles.card}>
                <View style={{ width: '85%' }}>
                <Text style={styles.drugName}>{drug.drug_name}</Text>

                <Text style={styles.interactionSummary}>
                  {interactionCount > 0
                    ? `${interactionCount} food interaction(s) found`
                    : 'No known food interactions' }
                </Text>

                {interactionCount > 0 ? (
                  interactions.map((interaction: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined, index: React.Key | null | undefined) => (
                    <Text key={index} style={styles.interactionText}>
                      • {interaction}
                    </Text>
                  ))
                ) : (
                 null
                )}

                <View style={styles.buttonContainer}>
                  {interactionCount > 0 && (
                  <TouchableOpacity onPress={() => handleNavigate(drug)}>
                    <Text style={styles.detailsButtonText}>More Details</Text>
                  </TouchableOpacity>)}
                  {interactionCount === 0 && !isHcp && (
                  <TouchableOpacity onPress={() => handleNavigate(drug)}>
                    <Text style={styles.detailsButtonText}>Counselling Tips</Text>
                  </TouchableOpacity>)}
                  
                </View>
                </View>

                <View style={{ width: '10%' }}>
                <TouchableOpacity onPress={() => onRemoveDrug(drug.drug_id)}>
                    <FontAwesome name="minus-circle" size={24} color="gray" />
                  </TouchableOpacity>
                </View>
                
              </View>
              
            );
          })
        )}
      </ScrollView>

      {selectedDrugs.length > 0 && (
        <View style={styles.clearButtonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={clearAllDrugs}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 10 
  },
  scrollContainer: { 
    paddingBottom: 20, 
    flexGrow: 1 
  },
  loading: { 
    flex: 1,  
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyMessage: { 
    fontSize: 16, 
    color: '#888', 
    textAlign: 'center', 
    marginTop: 20 
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10 
  },
  drugName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#0a7ea4', 
    marginTop: 5 
  },
  interactionSummary: { 
    fontSize: 16, 
    color: '#333', 
    marginTop: 5, 
    fontWeight: 'bold' 
  },
  interactionText: { 
    fontSize: 16, 
    color: '#333', 
    marginTop: 2 
  },
  noInteraction: { 
    fontSize: 14, 
    color: 'gray', 
    marginTop: 5, 
    fontStyle: 'italic' 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10 
  },
  detailsButton: { 
    backgroundColor: 'white', 
    padding: 8, 
    borderRadius: 5, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0a7ea4' 
  },
  detailsButtonText: { 
    color: '#0a7ea4', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  clearButton: {
    backgroundColor: '#0a7ea4',
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: '40%',
  },
  clearButtonText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: 'bold' 
  },
  clearButtonContainer: { 
    position: 'absolute', 
    bottom: 10, 
    left: 0, 
    right: 0, 
    alignItems: 'center' 
  },
});

export default SelectedDrugs;