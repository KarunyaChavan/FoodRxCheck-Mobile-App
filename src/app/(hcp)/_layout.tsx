import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  TouchableOpacityProps,
} from 'react-native';
import { Tabs, Redirect, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { useAuth } from '../../provider/AuthProvider';
import headerRight from '../../utils/headerRight';
import { useFocusEffect } from '@react-navigation/native';

export default function HcpLayout() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/" />;
  }
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false);

  
  useFocusEffect(
    useCallback(() => {
      // Close the modal when the screen loses focus
      return () => setModalVisible(false);
    }, [])
  );
  const toggleModal = () => {
    setModalVisible((prev) => !prev);
  };

  const handleOutsidePress = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: 'white' },
          tabBarActiveTintColor: 'black',
          tabBarInactiveTintColor: 'gray',
          tabBarShowLabel: true,
        }}
      >
        <Tabs.Screen
          name="hcp_home"
          options={{
            tabBarLabel: 'Drugs',
            headerShown: true,
            headerTitle: '',
            headerStyle: {
              height: 70,
            },
            headerRight: headerRight,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="hcp_food"
          options={{
            tabBarLabel: 'Food-Search',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="food-bank" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile-hcp"
          options={{
            tabBarLabel: 'Profile',
            href : null,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="user" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="suggest-hcp"
          options={{
            tabBarLabel: 'Suggestions',
            href: null,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="search" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="more-hcp"
          options={{
            tabBarLabel: 'More',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="navicon" size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props as TouchableOpacityProps}
                onPress={toggleModal}
              />
            ),
          }}
        />
      </Tabs>

      <Modal
        transparent
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={handleOutsidePress}>
          <Pressable style={styles.modalContainer}>

            <TouchableOpacity
              style={styles.listItem}
              onPress={() => {
                router.replace('/profile-hcp');
                setModalVisible(false);
              }}
            >
              <FontAwesome name="user" size={20} color="#0a7ea4" />
              <Text style={styles.listItemText}>Profile</Text>
              <Entypo name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.listItem}
              onPress={() => {
                router.replace('/suggest-hcp');
                setModalVisible(false);
              }}
            >
              <MaterialIcons name="chat-bubble" size={20} color="#0a7ea4" />
              <Text style={styles.listItemText}>Suggestions</Text>
              <Entypo name="chevron-right" size={20} color="#999" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '60%',
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: '#f2f0ef', // light off white color
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 15,
  },
});
