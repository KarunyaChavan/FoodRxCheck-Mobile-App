/**
 * @file Lists drug classifications for healthcare professional browsing using decoupled api layer.
 */

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';

import ErrorView from '../../../components/ui/ErrorView';
import LoadingState from '../../../components/ui/LoadingState';
import Colors from '../../../constant/Colors';
import { queryKeys } from '../../../constant/QueryKeys';
import { fetchClasses } from '../../../services/api/drugs';
import { DrugClass } from '../../../types/database.types';

type ClassListProps = {
  filter: string;
};

/**
 * Displays searchable drug classifications and routes users into subclasses.
 */
const ClassList: React.FC<ClassListProps> = ({ filter }) => {
  const router = useRouter();
  const {
    data: Classes,
    isLoading,
    error,
    refetch,
  } = useQuery<DrugClass[]>({
    queryKey: queryKeys.classes.all,
    queryFn: fetchClasses,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorView message={error.message} onRetry={refetch} />;
  }

  const filteredClasses = Classes?.filter((cls) =>
    cls.class_name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredClasses}
        keyExtractor={(item) => item.class_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/hcp_dynamic/sub-classes/[class_id]',
                params: { class_id: item.class_id.toString(), classname: item.class_name },
              })
            }
            activeOpacity={0.7}
          >
            <Text style={styles.className}>{item.class_name}</Text>
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
  className: {
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

export default ClassList;
