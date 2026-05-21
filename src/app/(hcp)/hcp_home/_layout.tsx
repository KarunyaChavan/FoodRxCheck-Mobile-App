/**
 * @file Hosts the HCP drug list and classification top-tab search experience.
 */

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import ClassList from './Classification';
import DrugList from './DrugList';
import SearchBar from '../../../components/Searchbar';

const Tab = createMaterialTopTabNavigator();

/**
 * Combines HCP drug browsing tabs with a shared search filter.
 */
const App = () => {
  const [filter, setFilter] = useState<string>('');

  return (
    <View style={styles.container}>
      <SearchBar filter={filter} setFilter={setFilter} />
      <Tab.Navigator>
        <Tab.Screen name="Drugs List">{() => <DrugList filter={filter} />}</Tab.Screen>
        <Tab.Screen name="Classification of Drugs">
          {() => <ClassList filter={filter} />}
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
