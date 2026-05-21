/**
 * @file Shows patient-facing general instruction details and images using decoupled api layer.
 */

import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';

import ZoomableImage from '@/components/Image-view';

import ErrorView from '../../../components/ui/ErrorView';
import LoadingState from '../../../components/ui/LoadingState';
import Colors from '../../../constant/Colors';
import { fetchGeneralInstructionDetail } from '../../../services/api/drugs';
import { GeneralInstruction } from '../../../types/database.types';

/**
 * Renders patient general-instruction details for a selected drug.
 */
const DrugDetails: React.FC = () => {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const {
    data: directionData,
    isLoading,
    error,
    refetch,
  } = useQuery<GeneralInstruction>({
    queryKey: ['instructions', id],
    queryFn: () => fetchGeneralInstructionDetail(id!),
    enabled: Boolean(id),
  });

  /**
   * Opens the selected drug image in a zoomable modal.
   */
  const openImageModal = (url: string) => {
    setImageUrl(url);
    setModalVisible(true);
  };

  /**
   * Closes the zoomable drug image modal.
   */
  const closeImageModal = () => {
    setModalVisible(false);
    setImageUrl(null);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorView message={error.message} onRetry={refetch} />;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: false,
          title: 'General Instructions',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
        }}
      />
      <View style={styles.drugInfo}>
        <Text style={styles.cardTitle}>{name}</Text>
      </View>
      <FlatList
        data={directionData ? [directionData] : []}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image_path ? (
              <View>
                <Text style={styles.cardsubTitle}>Image:</Text>
                <TouchableOpacity onPress={() => openImageModal(item.image_path!)}>
                  <Image source={{ uri: item.image_path }} style={styles.imageThumbnail} />
                  <Text style={styles.tapText}>Tap to view full image</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {item.instructions ? (
              <View style={{ marginTop: item.image_path ? 15 : 0 }}>
                <Text style={styles.cardsubTitle}>Instruction:</Text>
                <Text style={styles.cardText}>{item.instructions}</Text>
              </View>
            ) : null}
          </View>
        )}
      />

      {/* Modal for Fullscreen Image */}
      {modalVisible && imageUrl && (
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <ZoomableImage imageUrl={imageUrl} />
            <TouchableOpacity onPress={closeImageModal} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    ...Platform.select({
      ios: {
        marginTop: 38,
      },
    }),
  },
  drugInfo: {
    padding: 20,
    backgroundColor: Colors.light.cardBackground,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.light.text,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  cardsubTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: Colors.light.text,
  },
  imageThumbnail: {
    width: '80%',
    height: 150,
    alignSelf: 'center',
    borderRadius: 8,
  },
  tapText: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    marginTop: 5,
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    padding: 10,
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DrugDetails;
