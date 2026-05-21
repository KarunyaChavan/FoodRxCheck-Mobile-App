/**
 * @file Defines the patient-facing tab layout.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';

import SelectedDrugsButton from '../../utils/headerRight';

/**
 * Renders patient navigation tabs for counselling, food search, and suggestions.
 */
export default function PatientLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="pt_home"
        options={{
          tabBarLabel: 'Drugs',
          headerShown: true,
          headerTitle: '',
          headerStyle: {
            height: 70,
          },
          headerRight: () => <SelectedDrugsButton />,

          tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pt_food_search"
        options={{
          tabBarLabel: 'Food-Search',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="food-bank" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="suggest-drugs"
        options={{
          tabBarLabel: 'Suggestion',

          tabBarIcon: ({ color, size }) => <FontAwesome name="search" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
