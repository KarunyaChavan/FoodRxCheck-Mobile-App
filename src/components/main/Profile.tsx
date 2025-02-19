import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { useAuth } from "../../provider/AuthProvider";
import supabase from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';

const Profile = () => {
  const { user } = useAuth();
  const dropAnim = useRef(new Animated.Value(-200)).current;

  let qualificationData = null;
  try {
    qualificationData = user?.qualification ? JSON.parse(user.qualification) : null;
  } catch (error) {
    console.error("Error parsing qualification data:", error);
  }

  useFocusEffect(
    React.useCallback(() => {
      dropAnim.setValue(-200); // Reset animation value
      Animated.timing(dropAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerContainer, { top: dropAnim }]}>
        <Text style={styles.header}>Profile</Text>
      </Animated.View>
      <View style={styles.profileContainer}>
        <View style={styles.picContainer}>
          <Text style={styles.pic}>{user?.full_name?.charAt(0)}</Text>
        </View>
        <Text style={styles.nameText}>{user?.full_name}</Text>
        <Text style={styles.roleText}>Healthcare Professional</Text>
        {qualificationData && (
          <View style={styles.qualificationContainer}>
            <Text style={styles.qualificationHeader}>Qualification Details</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Sharing profile')}>
          <Text style={styles.menuItemText}><Text style={styles.boldText}>Degree: </Text>{qualificationData.degree}</Text>
        </TouchableOpacity><TouchableOpacity style={styles.menuItem} onPress={() => console.log('Sharing profile')}>
          <Text style={styles.menuItemText}><Text style={styles.boldText}>Department: </Text>{qualificationData.department}</Text>
        </TouchableOpacity><TouchableOpacity style={styles.menuItem} onPress={() => console.log('Sharing profile')}>
          <Text style={styles.menuItemText}><Text style={styles.boldText}>Institution: </Text>{qualificationData.institution}</Text>
        </TouchableOpacity>

          </View>
        )}
        <TouchableOpacity style={styles.button} onPress={() => supabase.auth.signOut()}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  headerContainer: {
    position: 'absolute',
    width: '100%',
    height: 200,
    backgroundColor: '#0a7ea4',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileContainer: {
    marginTop: 150,
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  picContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    marginBottom: 10,
  },
  pic: {
    fontSize: 35,
    color: '#fff',
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  roleText: {
    fontSize: 18,
    color: '#0a7ea4',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  qualificationContainer: {
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  qualificationHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  qualificationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'rgba(220, 90, 90, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '70%',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Profile;