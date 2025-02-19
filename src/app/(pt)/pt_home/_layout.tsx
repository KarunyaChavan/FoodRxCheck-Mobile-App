// App.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import SearchBar from '../../../components/Searchbar';
import General from './general_instructions';
import Couselling from './pt_counselling';

const Tab = createMaterialTopTabNavigator();

const App = () => {
  const [filter, setFilter] = useState<string>('');

  return (
    
      <View style={styles.container}>
        <SearchBar filter={filter} setFilter={setFilter} />
        <Tab.Navigator>
        <Tab.Screen name="Food-Drug Interaction">
            {() => <Couselling filter={filter} />}
          </Tab.Screen>
          <Tab.Screen name="General Instructions">  
            {() => <General filter={filter} />}
          </Tab.Screen>
          
        </Tab.Navigator>
      </View>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
