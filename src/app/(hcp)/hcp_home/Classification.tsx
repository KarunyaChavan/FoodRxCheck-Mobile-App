// screens/ClassList.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import supabase from '../../../lib/supabase';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

type Class = {
  class_id: number;
  class_name: string;
};

type ClassListProps = {
  filter: string;
};

const ClassList: React.FC<ClassListProps> = ({ filter }) => {
  const router = useRouter();
  const {data : Classes, isLoading, error } = useQuery<Class[]>({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data , error } =  await supabase
              .from('classes')
              .select('*')
              .order('class_name', { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
  if(isLoading){
    return <ActivityIndicator style={styles.loadingContainer} size="large" color="#000" />;
  }
  if(error){
    return <Text>Error: {error.message}</Text>;
  }

  const filteredClasses = Classes?.filter(cls =>
    cls.class_name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <View style={styles.container}>
        <FlatList
          data={filteredClasses}
          keyExtractor={(item) => item.class_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({ pathname: '/hcp_dynamic/sub-classes/[class_id]', params: { class_id: item.class_id.toString(), classname: item.class_name } })}
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
    backgroundColor: '#fff',
  },
  className: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ClassList;
