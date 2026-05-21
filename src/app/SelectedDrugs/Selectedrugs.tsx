/**
 * @file Displays selected drugs and compares their known interaction warnings using decoupled api layer.
 */

import { FontAwesome } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter, Stack } from 'expo-router';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

import ErrorView from '../../components/ui/ErrorView';
import LoadingState from '../../components/ui/LoadingState';
import Colors from '../../constant/Colors';
import { useAuth } from '../../provider/AuthProvider';
import { useDrugs } from '../../provider/DrugsProvider';
import { fetchDrugInteractions } from '../../services/api/interactions';

const getInteractionsMap = async (
  selectedDrugs: { drug_id: number; drug_name: string }[],
  isHcp: boolean,
) => {
  const interactionsMap: { [key: number]: { count: number; interactions: string[] } } = {};

  for (const drug of selectedDrugs) {
    try {
      const data = await fetchDrugInteractions(drug.drug_id, isHcp);
      const validInteractions = data
        .map((item) => item.food)
        .filter((interaction) => interaction && interaction !== 'NA');

      interactionsMap[drug.drug_id] = {
        count: validInteractions.length,
        interactions: validInteractions,
      };
    } catch (error) {
      console.error(`Error loading interactions for drug ${drug.drug_id}:`, error);
      interactionsMap[drug.drug_id] = { count: 0, interactions: [] };
    }
  }

  return interactionsMap;
};

/**
 * Lists selected drugs and loads possible interactions between them.
 */
const SelectedDrugs = () => {
  const { selectedDrugs, onRemoveDrug } = useDrugs();
  const router = useRouter();
  const { isHcp, user } = useAuth();
  const keyUser = user?.id || 'patient';

  const {
    data: interactionData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['selectedinteractions', keyUser],
    queryFn: () => getInteractionsMap(selectedDrugs, isHcp),
    enabled: selectedDrugs.length > 0,
  });

  // Clear all selected drugs
  const clearAllDrugs = () => {
    selectedDrugs.forEach((drug) => onRemoveDrug(drug.drug_id));
  };

  // Navigate to DrugInteractionList page
  const handleNavigate = (drug: { drug_id: any; drug_name: any }) => {
    const path = isHcp ? '/hcp_dynamic/drug-details/[id]' : '/patient_dynamic/int-drugs-pt/[id]';

    router.push({
      pathname: path,
      params: { id: drug.drug_id.toString(), name: drug.drug_name },
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorView message={error.message} onRetry={refetch} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Selected Drugs',
          headerStyle: { backgroundColor: Colors.light.primary },
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
                      : 'No known food interactions'}
                  </Text>

                  {interactionCount > 0
                    ? interactions.map((interaction: string, index: number) => (
                        <Text key={index} style={styles.interactionText}>
                          • {interaction}
                        </Text>
                      ))
                    : null}

                  <View style={styles.buttonContainer}>
                    {interactionCount > 0 && (
                      <TouchableOpacity onPress={() => handleNavigate(drug)}>
                        <Text style={styles.detailsButtonText}>More Details</Text>
                      </TouchableOpacity>
                    )}
                    {interactionCount === 0 && !isHcp && (
                      <TouchableOpacity onPress={() => handleNavigate(drug)}>
                        <Text style={styles.detailsButtonText}>Counselling Tips</Text>
                      </TouchableOpacity>
                    )}
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
    backgroundColor: Colors.light.background,
    padding: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginTop: 5,
  },
  interactionSummary: {
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 5,
    fontWeight: 'bold',
  },
  interactionText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  detailsButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: Colors.light.primary,
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
    fontWeight: 'bold',
  },
  clearButtonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default SelectedDrugs;
