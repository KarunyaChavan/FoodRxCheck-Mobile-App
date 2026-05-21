/**
 * @file Implements shared food-drug search across patient and HCP flows using decoupled api layer.
 */

import { FontAwesome } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

import ErrorView from '../components/ui/ErrorView';
import LoadingState from '../components/ui/LoadingState';
import Colors from '../constant/Colors';
import { fetchDrugsByFood } from '../services/api/interactions';
import { Drug } from '../types/database.types';

interface FoodSearchProps {
  placeholder: string;
  routePath: string;
  interactionsTable: string;
  drugsTable: string;
}

/**
 * Displays food interaction search results and routes selected drugs to detail pages.
 */
const FoodSearchComponent: React.FC<FoodSearchProps> = ({
  placeholder,
  routePath,
  interactionsTable,
  drugsTable,
}) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: drugs,
    isLoading,
    error,
    refetch,
  } = useQuery<Drug[]>({
    queryKey: [`searchDrugs-${interactionsTable}-${drugsTable}`, searchTerm],
    queryFn: () => fetchDrugsByFood(searchTerm, interactionsTable, drugsTable),
    enabled: false, // Only fetch on button press
  });

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const rollingTextItems = [
    "Search for 'Tea'",
    "Search for 'Grapefruit'",
    "Search for 'Coffee'",
    "Search for 'Meal'",
    "Search for 'Orange'",
    "Search for 'Food'",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % rollingTextItems.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 1400);

    return () => clearInterval(interval);
  }, [fadeAnim, rollingTextItems.length]);

  /**
   * Clears the active food-search input and refreshes cached results.
   */
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => refetch()}>
          <FontAwesome name="search" size={20} color="white" />
        </TouchableOpacity>

        {searchTerm.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
            <FontAwesome name="times" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {searchTerm === '' && !isLoading && !drugs && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.instructionsText}>Enter food item to find Their interactions</Text>
          <View style={{ alignSelf: 'center', display: 'flex', flexDirection: 'row' }}>
            <Animated.Text style={[styles.instructionsText, { opacity: fadeAnim }]}>
              {rollingTextItems[currentIndex]}
            </Animated.Text>
          </View>
        </View>
      )}

      {isLoading && <LoadingState />}

      {error && <ErrorView message={error.message} onRetry={refetch} />}

      {drugs && drugs.length === 0 && !isLoading && !error && searchTerm && (
        <Text style={styles.noResultsText}>No Drugs Found</Text>
      )}

      {drugs && drugs.length > 0 && (
        <FlatList
          data={drugs}
          keyExtractor={(item) => item.drug_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: routePath as any,
                  params: { id: item.drug_id.toString(), name: item.drug_name },
                })
              }
            >
              <Text style={styles.drugName}>{item.drug_name}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: Colors.light.text,
  },
  searchButton: {
    backgroundColor: Colors.light.primary,
    padding: 5,
    borderRadius: 8,
  },
  clearButton: {
    backgroundColor: 'gray',
    padding: 5,
    borderRadius: 8,
    marginLeft: 10,
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: Colors.light.primary,
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 8,
    marginHorizontal: 10,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 20,
  },
});

export default FoodSearchComponent;
