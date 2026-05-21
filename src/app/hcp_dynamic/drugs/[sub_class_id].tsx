/**
 * @file Lists drugs belonging to a selected HCP subclass using decoupled api layer.
 */

import { useQuery } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams, Stack, Redirect } from 'expo-router';
import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

import SearchBar from '../../../components/Searchbar';
import ErrorView from '../../../components/ui/ErrorView';
import LoadingState from '../../../components/ui/LoadingState';
import Colors from '../../../constant/Colors';
import { queryKeys } from '../../../constant/QueryKeys';
import { useAuth } from '../../../provider/AuthProvider';
import { fetchSubClassDrugs } from '../../../services/api/drugs';
import { Drug } from '../../../types/database.types';

/**
 * Lists all drugs for a selected subclass and routes to HCP details.
 */
const DrugList = () => {
  const { session } = useAuth();
  const router = useRouter();
  const { sub_class_id, subclassname } = useLocalSearchParams<{
    sub_class_id: string;
    subclassname: string;
  }>();
  const [filter, setFilter] = useState<string>('');

  const {
    data: drugs,
    isLoading,
    error,
    refetch,
  } = useQuery<Drug[]>({
    queryKey: queryKeys.drugs.bySubClass(sub_class_id!),
    queryFn: () => fetchSubClassDrugs(sub_class_id!),
    enabled: Boolean(session && sub_class_id),
  });

  if (!session) {
    return <Redirect href="/" />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorView message={error.message} onRetry={refetch} />;
  }

  const filteredDrugs = drugs?.filter((drug) =>
    drug.drug_name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: false,
          title: `SubClass : ${subclassname}`,
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontSize: 16 },
        }}
      />

      <SearchBar filter={filter} setFilter={setFilter} />

      <View style={styles.list}>
        <FlatList
          data={filteredDrugs}
          keyExtractor={(item) => item.drug_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: `/hcp_dynamic/drug-details/[id]`,
                  params: { id: item.drug_id.toString(), name: item.drug_name },
                })
              }
            >
              <Text style={styles.drugName}>{item.drug_name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    ...Platform.select({
      ios: {
        marginTop: 38,
      },
    }),
  },
  list: {
    flex: 1,
    paddingLeft: 10,
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
  },
});

export default DrugList;
