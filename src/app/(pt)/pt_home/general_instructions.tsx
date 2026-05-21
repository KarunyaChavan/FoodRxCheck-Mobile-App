/**
 * @file Lists patient general instructions for selected drugs using decoupled api layer.
 */

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

import ErrorView from '../../../components/ui/ErrorView';
import LoadingState from '../../../components/ui/LoadingState';
import Colors from '../../../constant/Colors';
import { fetchAllGeneralInstructions } from '../../../services/api/drugs';
import { GeneralInstruction } from '../../../types/database.types';

/**
 * Shows filtered general-instruction drug records for patient education.
 */
const Drugs: React.FC<{ filter: string }> = ({ filter }) => {
  const router = useRouter();
  const {
    data: Drugs,
    isLoading,
    error,
    refetch,
  } = useQuery<GeneralInstruction[]>({
    queryKey: ['general_instructions'],
    queryFn: fetchAllGeneralInstructions,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorView message={error.message} onRetry={refetch} />;
  }

  const filteredDrugs = Drugs?.filter((drug) =>
    drug.drug.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredDrugs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: `/patient_dynamic/drugs-pt/[id]`,
                params: { id: item.id.toString(), name: item.drug },
              })
            }
          >
            <Text style={styles.drugName}>{item.drug}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  card: {
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    backgroundColor: Colors.light.cardBackground,
    padding: 8,
    paddingVertical: 14,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: Colors.light.primary,
    borderRightWidth: 5,
    borderRightColor: Colors.light.primary,
  },
});

export default Drugs;
