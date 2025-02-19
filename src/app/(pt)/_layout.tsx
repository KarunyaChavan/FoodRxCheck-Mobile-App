import { Tabs, Redirect } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useAuth } from '../../provider/AuthProvider';
import headerRight from '../../utils/headerRight';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function PatientLayout() {
  return (
    
    <Tabs screenOptions={{ headerShown: false ,tabBarActiveTintColor: 'black',tabBarInactiveTintColor: 'gray',tabBarShowLabel: true,}}>
       <Tabs.Screen name='pt_home'
    options={{
      tabBarLabel: 'Drugs',
      headerShown: true,
          headerTitle: '',
          headerStyle: {
            height: 70,
          },
          headerRight: headerRight,
      
      tabBarIcon: ({color,size}) => (
        <FontAwesome name="home" size={size} color={color} />
      )
    }
    }
    />
    <Tabs.Screen
        name="pt_food_search"
        options={{
          tabBarLabel: 'Food-Search',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="food-bank" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="suggest-drugs"
        options={{
          tabBarLabel: 'Suggestion',
         
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="search" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
   
  );
}