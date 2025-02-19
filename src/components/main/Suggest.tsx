import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import supabase from '../../lib/supabase';
import { useAuth } from '../../provider/AuthProvider';
import { FontAwesome } from '@expo/vector-icons';

const Suggest = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('Drug Missing');
  const [description, setDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const queryOptions = [
    'Drug Missing',
    'Required More Info',
    'Other',
  ];

  const handleSubmit = async () => {
    if (description === '') {
      Alert.alert('Error', 'Please fill the description');
      return;
    }

    const { error } = await supabase
      .from('suggestions')
      .insert([{ name: user?.full_name, role: user?.role, query, description }]);

    if (error) {
      console.error(error);
      Alert.alert('Error', 'There was an error submitting your suggestion');
    } else {
      Alert.alert('Success', 'Your suggestion has been submitted');
      setQuery('Drug Missing');
      setDescription('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Submit a Suggestion</Text>

      <Text style={styles.label}>Query</Text>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownText}>{query}</Text>
        <FontAwesome
                name="chevron-right"
                size={15}
                color="black"
                style={{ transform:'90deg' }}
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
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  dropdownButton: {
    padding: 12,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0a7ea4',
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#d9534f',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Suggest;
