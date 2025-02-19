import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, Stack, Redirect } from 'expo-router';
import supabase from '../../../lib/supabase';
import SearchBar from '../../../components/Searchbar';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../provider/AuthProvider';

type Drug = {
  drug_id: number;
  drug_name: string;
};

const DrugList = () => {
  const { session } = useAuth();
  if (!session ) {
    return <Redirect href="/" />;
  }

  const router = useRouter();
  const { sub_class_id, subclassname } = useLocalSearchParams<{ sub_class_id: string, subclassname: string }>();
  const [filter, setFilter] = useState<string>('');

  const { data: drugs, isLoading, error } = useQuery<Drug[]>({
    queryKey: ['drugs', sub_class_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drugs')
        .select('*')
        .eq('subclass_id', sub_class_id)
        .order('drug_name', { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  if (isLoading) {
    return <ActivityIndicator style={styles.loadingContainer} size="large" color="#000" />;
  }
  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  const filteredDrugs = drugs?.filter(drug =>
    drug.drug_name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: false,
          title: `SubClass : ${subclassname}`,
          headerStyle: { backgroundColor: '#0a7ea4' },
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
              onPress={() => router.push({ pathname: `/hcp_dynamic/drug-details/[id]`, params: { id: item.drug_id.toString(), name: item.drug_name } })}
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
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        marginTop: 38,
      },
    }),
  },
  list: {
    flex: 1,  // Ensure the FlatList container takes up the available space
    paddingLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 8,
    paddingVertical: 14,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#0a7ea4'
  },
});

export default DrugList;
