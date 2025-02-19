import React, { useState, useEffect, useRef  } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity,Animated} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import supabase from '../lib/supabase'; 
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const fetchDrugsByFood = async (food: string, interactionsTable: string, drugsTable: string) => {
  if (!food.trim()) return [];

  const { data: interactions, error: interactionsError } = await supabase
    .from(interactionsTable)
    .select('drug_id')
    .ilike('food', `%${food.toLowerCase()}%`);

  if (interactionsError) {
    console.error('Error fetching interactions:', interactionsError);
    throw new Error(interactionsError.message);
  }

  const drugIds = interactions.map((interaction) => interaction.drug_id);

  if (drugIds.length === 0) return [];

  const { data: drugs, error: drugsError } = await supabase
    .from(drugsTable)
    .select('drug_id, drug_name')
    .in('drug_id', drugIds);

  if (drugsError) {
    console.error('Error fetching drugs:', drugsError);
    throw new Error(drugsError.message);
  }

  return drugs;
};

interface FoodSearchProps {
  placeholder: string;
  routePath: string;
  interactionsTable: string;
  drugsTable: string;
}

const FoodSearchComponent: React.FC<FoodSearchProps> = ({ placeholder, routePath, interactionsTable, drugsTable }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: drugs, isLoading, error, refetch } = useQuery({
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
        <View style={{marginTop: 20}}>
          <Text style={styles.instructionsText}>Enter food item to find Their interactions</Text> 
        <View style={{ alignSelf: 'center', display: 'flex', flexDirection: 'row' }}>
        <Animated.Text style={[styles.instructionsText, { opacity: fadeAnim }]}>
          {rollingTextItems[currentIndex]}
        </Animated.Text>
      </View>
      </View>
      )}

      {isLoading && <ActivityIndicator size="large" color="#0a7ea4" style={{ marginTop: 20 }} />}

      {error && <Text style={styles.errorText}>Error: {error.message}</Text>}

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
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#0a7ea4',
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
    backgroundColor: 'white',
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#0a7ea4',
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop:8,
    marginHorizontal: 10,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
});

export default FoodSearchComponent;
