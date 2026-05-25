/**
 * @file Lists subclasses or direct drugs for a selected HCP class using decoupled api layer.
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
import { fetchSubClasses, fetchClassDrugs } from '../../../services/api/drugs';
import { SubClass, Drug } from '../../../types/database.types';

/**
 * Lists subclasses for a drug class, falling back to direct drugs when needed.
 */
const SubClassList = () => {
  const { session } = useAuth();
  const router = useRouter();
  const { class_id, classname } = useLocalSearchParams<{ class_id: string; classname: string }>();
  const [filter, setFilter] = useState<string>('');

  const {
    data: subClasses,
    isLoading: isSubClassesLoading,
    error: subClassesError,
    refetch: refetchSubClasses,
  } = useQuery<SubClass[]>({
    queryKey: queryKeys.classes.subClasses(class_id),
    queryFn: () => fetchSubClasses(class_id!),
    enabled: Boolean(session && class_id),
  });

  const {
    data: drugs,
    isLoading: isDrugsLoading,
    error: drugsError,
    refetch: refetchDrugs,
  } = useQuery<Drug[]>({
    queryKey: queryKeys.drugs.byClass(class_id),
    queryFn: () => fetchClassDrugs(class_id!),
    enabled: Boolean(session && class_id && subClasses?.length === 0),
  });

  if (!session) {
    return <Redirect href={'/'} />;
  }

  if (isSubClassesLoading || isDrugsLoading) {
    return <LoadingState />;
  }

  if (subClassesError) {
    return <ErrorView message={subClassesError.message} onRetry={refetchSubClasses} />;
  }

  if (drugsError) {
    return <ErrorView message={drugsError.message} onRetry={refetchDrugs} />;
  }

  const filteredSubClasses = subClasses?.filter((subClass) =>
    subClass.name.toLowerCase().includes(filter.toLowerCase()),
  );

  const filteredDrugs = drugs?.filter((drug) =>
    drug.drug_name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: false,
          title: `Class : ${classname}`,
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
        }}
      />
      <SearchBar filter={filter} setFilter={setFilter} />
      {subClasses?.length === 0 ? (
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
      ) : (
        <FlatList
          data={filteredSubClasses}
          keyExtractor={(item, index) => String(item.subclass_id ?? index)}
          renderItem={({ item }) => {
            const id = item.subclass_id;
            const handlePress = () => {
                if (id === null || id === undefined) {return;}
              router.push({
                pathname: `/hcp_dynamic/drugs/[subclass_id]`,
                params: { subclass_id: String(id), subclassname: item.name },
              });
            };

            return (
              <TouchableOpacity style={styles.card} onPress={handlePress}>
                <Text style={styles.subClassName}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
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
  subClassName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
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

export default SubClassList;
