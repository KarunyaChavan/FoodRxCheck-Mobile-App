import React, { useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams, Stack,Redirect } from 'expo-router';
import supabase from '../../../lib/supabase';
import { Platform } from 'react-native';
import SearchBar from '../../../components/Searchbar';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../provider/AuthProvider';

type SubClass = {
  sub_class_id: number;
  name: string;
};

type Drug = {
  drug_id: number;
  drug_name: string;
};

const SubClassList = () => {
  const {session} = useAuth();
    if(!session ){
      return <Redirect href={'/'} />;
    }
  const router = useRouter();
  const { class_id, classname } = useLocalSearchParams<{ class_id: string, classname: string }>();
  const [filter, setFilter] = useState<string>('');

  const { data: subClasses, isLoading: isSubClassesLoading, error: subClassesError } = useQuery<SubClass[]>({
    queryKey: ['sub_classes', class_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_classes')
        .select('*')
        .eq('class_id', class_id)
        .order('name', { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });

  const { data: drugs, isLoading: isDrugsLoading, error: drugsError } = useQuery<Drug[]>({
    queryKey: ['drugs', class_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drugs')
        .select('*')
        .eq('class_id', class_id)
        .order('drug_name', { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: subClasses?.length === 0, // Only fetch drugs if there are no sub-classes
  });

  if (isSubClassesLoading || isDrugsLoading) {
    return <ActivityIndicator style={styles.loadingContainer} size="large" color="#000" />;
  }

  if (subClassesError) {
    return <Text>Error: {subClassesError.message}</Text>;
  }

  if (drugsError) {
    return <Text>Error: {drugsError.message}</Text>;
  }

  const filteredSubClasses = subClasses?.filter(subClass =>
    subClass.name.toLowerCase().includes(filter.toLowerCase())
  );

  const filteredDrugs = drugs?.filter(drug =>
    drug.drug_name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTransparent: false, title: `Class : ${classname}`, headerStyle: { backgroundColor: '#0a7ea4' }, headerTintColor: '#fff' }} />
      <SearchBar filter={filter} setFilter={setFilter} />
      {subClasses?.length === 0 ? (
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
      ) : (
        <FlatList
          data={filteredSubClasses}
          keyExtractor={(item) => item.sub_class_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: `/hcp_dynamic/drugs/[sub_class_id]`, params: { sub_class_id: item.sub_class_id.toString(), subclassname: item.name } })}
            >
              <Text style={styles.subClassName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        marginTop: 38
      },
      android: {
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: 'lightseagreen',
    alignItems: 'center',
    width: '100%',
  },
  headerText: {
    fontSize: 18,
    paddingHorizontal: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    width: '90%',
    marginTop: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
  },
  clearButton: {
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 8,
  },
  subClassName: {
    fontSize: 18,
    fontWeight: 'bold',
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
    borderLeftColor: '#0a7ea4',
  },
});

export default SubClassList;
