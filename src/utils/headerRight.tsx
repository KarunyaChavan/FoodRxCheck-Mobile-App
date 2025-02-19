import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useDrugs } from '../provider/DrugsProvider';

const SelectedDrugsButton: React.FC = () => {
  const router = useRouter();
  const { selectedDrugs } = useDrugs();
  const selectedCount = selectedDrugs?.length;

  return (
    <Pressable onPress={() => router.push('/SelectedDrugs/Selectedrugs')}>
      {({ pressed }) => (
        <View style={[styles.buttonContainer, pressed && styles.pressed]}>
          <FontAwesome name="list-alt" size={20} color={'#0a7ea4'} />
          <View style={styles.textContainer}>
            <Text style={styles.text}>Selected</Text>
            <Text style={styles.text}>Drugs</Text>
          </View>

          {selectedCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{selectedCount}</Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 2,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'gray',
    position: 'relative',
  },
  pressed: {
    backgroundColor: '#e0f7fa',
  },
  textContainer: {
    marginLeft: 5,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  badge: {
    position: 'absolute',
    bottom: -6,
    left: -6,
    backgroundColor: '#0a7ea4',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SelectedDrugsButton;
