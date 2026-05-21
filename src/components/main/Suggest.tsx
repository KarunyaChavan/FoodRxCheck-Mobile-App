/**
 * @file Provides the drug suggestion form submitted to Supabase using decoupled api layer.
 */

import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
} from 'react-native';

import Colors from '../../constant/Colors';
import { useAuth } from '../../provider/AuthProvider';
import { submitSuggestion } from '../../services/api/suggestions';

/**
 * Displays the drug suggestion form and submits it to Supabase.
 */
const Suggest = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('Drug Missing');
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const queryOptions = ['Drug Missing', 'Required More Info', 'Other'];

  const handleSubmit = async () => {
    if (description.trim() === '') {
      Alert.alert('Error', 'Please fill the description');
      return;
    }

    try {
      await submitSuggestion({
        name: user?.full_name || null,
        role: user?.role || null,
        query,
        description,
      });

      Alert.alert('Success', 'Your suggestion has been submitted');
      setQuery('Drug Missing');
      setDescription('');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'There was an error submitting your suggestion');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Submit a Suggestion</Text>

      <Text style={styles.label}>Query</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.dropdownText}>{query}</Text>
        <FontAwesome
          name="chevron-right"
          size={15}
          color={Colors.light.text}
          style={{ transform: [{ rotate: '90deg' }] }}
        />
      </TouchableOpacity>

      {/* Modal for selecting query */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Query Type</Text>
            <FlatList
              data={queryOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    setQuery(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Text style={styles.label}>Description (up to 50 words)</Text>
      <TextInput
        style={styles.textArea}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={250}
        placeholder="Enter your suggestion..."
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 10,
    backgroundColor: '#f3f2ed',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.light.text,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  dropdownButton: {
    padding: 12,
    marginRight: 5,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 5,
    backgroundColor: Colors.light.cardBackground,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    height: 100,
    borderColor: Colors.light.border,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.cardBackground,
    textAlignVertical: 'top',
    color: Colors.light.text,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 15,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: Colors.light.cardBackground,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: Colors.light.text,
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  optionText: {
    fontSize: 16,
    color: Colors.light.text,
  },
});

export default Suggest;
