import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';

const Main = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTransparent: true, headerTitle: '' }} />
      <View style={styles.contentWrapper}>
        <Image source={require('../../assets/images/drugSpecs.png')} style={styles.image} />
        <Text style={styles.title}>Your Ultimate
          <Text style={{ color: '#0a7ea4' }}> Drug Interaction </Text>
          App
        </Text>
        <Text style={styles.subtitle}>Find Your Drugs and Food Interactions</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(true)}>
        <Text style={styles.btnText}>Let's Get Started</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
        Designed and Developed by P.E.S’s MCOP and MCOE
        </Text>
      </View>

      {/* Modal for Role Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Continue As</Text>
            <TouchableOpacity style={styles.optionBtn} onPress={() => { 
              setModalVisible(false);
              router.push('/(pt)/pt_home/pt_counselling');
            }}>
              <Text style={styles.optionText}>Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionBtn} onPress={() => { 
              setModalVisible(false);
              router.push('/sign-in');
            }}>
              <Text style={styles.optionText}>Healthcare Professional</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: 270,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'outfit-bold',
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'outfit',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'darkgray',
    textAlign: 'center',
    marginTop: 10,
  },
  btn: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    elevation: 5,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#0a7ea4',
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    color: '#0a7ea4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelText: {
    marginTop: 10,
    fontSize: 14,
    color: 'gray',
  }
});
