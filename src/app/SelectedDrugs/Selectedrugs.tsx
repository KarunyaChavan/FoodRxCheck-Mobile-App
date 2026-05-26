/**
 * @file Displays selected drugs and compares their known interaction warnings using decoupled api layer.
 */

import { FontAwesome } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import ErrorView from '../../components/ui/ErrorView';
import LoadingState from '../../components/ui/LoadingState';
import Colors from '../../constant/Colors';
import { queryKeys } from '../../constant/QueryKeys';
import { useAuth } from '../../provider/AuthProvider';
import { useDrugs } from '../../provider/DrugsProvider';
import { fetchDrugInteractions } from '../../services/api/interactions';
import { registerForPushNotificationsAsync, scheduleDrugReminder } from '../../utils/notifications';

type SelectedDrugItem = {
  drug_id: number;
  drug_name: string;
  schedules?: string[];
};

const TIME_24H_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/**
 * Returns an `HH:MM` string for the provided date.
 */
const toTimeString = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Sorts times in ascending order using lexical compare on normalized `HH:MM` strings.
 */
const sortTimeStrings = (times: string[]) => [...times].sort((a, b) => a.localeCompare(b));

/**
 * Builds a unique, sorted schedule array by appending a new time to existing times.
 */
const mergeSchedules = (existing: string[] | undefined, nextTime: string) => {
  const merged = new Set([...(existing ?? []), nextTime]);
  return sortTimeStrings(Array.from(merged));
};

/**
 * Parses an `HH:MM` value and returns a Date aligned to today.
 */
const parsePromptTime = (input: string) => {
  const match = input.trim().match(TIME_24H_REGEX);
  if (!match) {
    return null;
  }

  const parsedDate = new Date();
  parsedDate.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return parsedDate;
};

/**
 * Loads interaction summaries for each selected drug.
 */
const getInteractionsMap = async (
  selectedDrugs: { drug_id: number; drug_name: string }[],
  isHcp: boolean,
) => {
  const interactionsMap: { [key: number]: { count: number; interactions: string[] } } = {};

  for (const drug of selectedDrugs) {
    try {
      const data = await fetchDrugInteractions(drug.drug_id, isHcp);
      const validInteractions = data
        .map((item) => item.food)
        .filter((interaction) => interaction && interaction !== 'NA');

      interactionsMap[drug.drug_id] = {
        count: validInteractions.length,
        interactions: validInteractions,
      };
    } catch (error) {
      console.error(`Error loading interactions for drug ${drug.drug_id}:`, error);
      interactionsMap[drug.drug_id] = { count: 0, interactions: [] };
    }
  }

  return interactionsMap;
};

/**
 * Lists drugs saved in the user's cabinet and loads possible interactions between them.
 */
const SelectedDrugs = () => {
  const { selectedDrugs, adherenceLogs, onRemoveDrug, onUpdateSchedule, onLogDose } = useDrugs();
  const router = useRouter();
  const { isHcp, user } = useAuth();
  const keyUser = user?.id || 'patient';

  const [showPickerForDrugId, setShowPickerForDrugId] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [webReminderModalVisible, setWebReminderModalVisible] = useState(false);
  const [webReminderInput, setWebReminderInput] = useState('');
  const [webReminderDrugId, setWebReminderDrugId] = useState<number | null>(null);

  /**
   * Resolves a selected drug by its numeric id.
   */
  const findSelectedDrug = (drugId: number): SelectedDrugItem | undefined =>
    selectedDrugs.find((drug) => drug.drug_id === drugId);

  /**
   * Returns a comma-separated reminder label from schedules.
   */
  const formatSchedules = (schedules: string[] | undefined) =>
    (schedules && schedules.length > 0 ? schedules.join(', ') : '');

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const hasTakenToday = (drugId: number) => {
    const logs = adherenceLogs[drugId] || [];
    const today = new Date().toDateString();
    return logs.some(log => new Date(log).toDateString() === today);
  };

  /**
   * Clears the reminder picker state.
   */
  const closeReminderPicker = () => {
    setShowPickerForDrugId(null);
  };

  /**
   * Closes the web reminder modal and clears transient input state.
   */
  const closeWebReminderModal = () => {
    setWebReminderModalVisible(false);
    setWebReminderInput('');
    setWebReminderDrugId(null);
  };

  const applyReminder = async (drugId: number, date: Date, isWebFallback = false) => {
    const drug = findSelectedDrug(drugId);
    if (!drug) {return;}

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeStr = toTimeString(date);
    const updatedSchedules = mergeSchedules(drug.schedules, timeStr);

    onUpdateSchedule(drugId, updatedSchedules);

    try {
      if (!isWebFallback) {
        await scheduleDrugReminder(drug.drug_name, hours, minutes);
      }
      Alert.alert('Reminder Added', `Reminder added at ${timeStr} daily.`);
    } catch (reminderError) {
      console.error('Failed to schedule notification reminder:', reminderError);
      Alert.alert(
        'Schedule Saved',
        `Schedule added at ${timeStr}. Notifications are unavailable on this platform.`,
      );
    }
  };

  /**
   * Validates and saves a web reminder time entered in the modal.
   */
  const submitWebReminderTime = () => {
    if (webReminderDrugId === null) {
      closeWebReminderModal();
      return;
    }

    const parsedDate = parsePromptTime(webReminderInput);
    if (!parsedDate) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 08:30).');
      return;
    }

    void applyReminder(webReminderDrugId, parsedDate, true);
    closeWebReminderModal();
  };

  const handleTimeChange = async (
    event: DateTimePickerEvent,
    selectedDate?: Date,
    explicitDrugId?: number,
  ) => {
    const drugId = explicitDrugId ?? showPickerForDrugId;

    if (event.type === 'dismissed') {
      closeReminderPicker();
      return;
    }

    if (event.type === 'set' && selectedDate && drugId !== null && drugId !== undefined) {
      await applyReminder(drugId, selectedDate);
    }

    closeReminderPicker();
  };

  const openReminderPicker = (drugId: number) => {
    const now = new Date();
    setSelectedTime(now);

    if (Platform.OS === 'web') {
      const defaultTime = toTimeString(now);
      setWebReminderInput(defaultTime);
      setWebReminderDrugId(drugId);
      setWebReminderModalVisible(true);
      return;
    }

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: now,
        mode: 'time',
        is24Hour: true,
        onChange: (event, date) => {
          handleTimeChange(event, date, drugId);
        },
      });
      return;
    }

    setShowPickerForDrugId(drugId);
  };

  const {
    data: interactionData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.interactions.selected(keyUser),
    queryFn: () => getInteractionsMap(selectedDrugs, isHcp),
    enabled: selectedDrugs.length > 0,
  });

  /**
   * Removes all drugs from the cabinet.
   */
  const clearAllDrugs = () => {
    selectedDrugs.forEach((drug) => onRemoveDrug(drug.drug_id));
  };

  /**
   * Routes to the role-specific details screen for a selected drug.
   */
  const handleNavigate = (drug: SelectedDrugItem) => {
    const path = isHcp ? '/hcp_dynamic/drug-details/[id]' : '/patient_dynamic/int-drugs-pt/[id]';

    router.push({
      pathname: path,
      params: { id: drug.drug_id.toString(), name: drug.drug_name },
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorView message={error.message} onRetry={refetch} />;
  }

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {selectedDrugs.length === 0 ? (
          <Text style={styles.emptyMessage}>Your cabinet is empty. Search for medicines to add them.</Text>
        ) : (
          selectedDrugs.map((drug) => {
            const interactions = interactionData?.[drug.drug_id]?.interactions || [];
            const interactionCount = interactions.length;
            const hasSchedules = (drug.schedules?.length ?? 0) > 0;
            const scheduleLabel = hasSchedules
              ? `Scheduled: ${formatSchedules(drug.schedules)}`
              : 'No reminders set';
            const reminderLabel = hasSchedules ? '+ Add Reminder' : '+ Set Reminder';

            return (
              <View key={drug.drug_id} style={styles.card}>
                <View style={{ width: '85%' }}>
                  <Text style={styles.drugName}>{drug.drug_name}</Text>

                  <Text style={styles.interactionSummary}>
                    {interactionCount > 0
                      ? `${interactionCount} food interaction(s) found`
                      : 'No known food interactions'}
                  </Text>

                  {interactionCount > 0
                    ? interactions.map((interaction: string, index: number) => (
                        <Text key={index} style={styles.interactionText}>
                          • {interaction}
                        </Text>
                      ))
                    : null}

                  <View style={styles.buttonContainer}>
                    {interactionCount > 0 && (
                      <TouchableOpacity onPress={() => handleNavigate(drug)} style={styles.actionButton}>
                        <Text style={styles.detailsButtonText}>More Details</Text>
                      </TouchableOpacity>
                    )}
                    {interactionCount === 0 && !isHcp && (
                      <TouchableOpacity onPress={() => handleNavigate(drug)} style={styles.actionButton}>
                        <Text style={styles.detailsButtonText}>Counselling Tips</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {!isHcp && (
                    <View style={styles.adherenceContainer}>
                      <View style={styles.scheduleContainer}>
                        {hasSchedules ? (
                          <Text style={styles.scheduleText}>{scheduleLabel}</Text>
                        ) : (
                          <Text style={styles.scheduleEmptyText}>{scheduleLabel}</Text>
                        )}
                        <TouchableOpacity onPress={() => openReminderPicker(drug.drug_id)}>
                          <Text style={styles.reminderLink}>{reminderLabel}</Text>
                        </TouchableOpacity>
                      </View>

                      {hasTakenToday(drug.drug_id) ? (
                        <View style={styles.takenBadge}>
                          <FontAwesome name="check-circle" size={16} color="white" />
                          <Text style={styles.takenText}>Taken Today</Text>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.takeDoseButton} onPress={() => onLogDose(drug.drug_id)}>
                          <Text style={styles.takeDoseText}>Take Dose</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                <View style={{ width: '10%' }}>
                  <TouchableOpacity onPress={() => onRemoveDrug(drug.drug_id)}>
                    <FontAwesome name="minus-circle" size={24} color="gray" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        {selectedDrugs.length > 0 && (
          <View style={styles.clearButtonContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={clearAllDrugs}>
              <Text style={styles.clearButtonText}>Empty Cabinet</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={webReminderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeWebReminderModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Reminder Time</Text>
            <Text style={styles.modalHint}>Use 24-hour format (HH:MM)</Text>
            <TextInput
              value={webReminderInput}
              onChangeText={setWebReminderInput}
              placeholder="08:30"
              autoFocus
              keyboardType="numbers-and-punctuation"
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={closeWebReminderModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveButton} onPress={submitWebReminderTime}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {showPickerForDrugId !== null && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginTop: 5,
  },
  interactionSummary: {
    fontSize: 16,
    color: Colors.light.text,
    marginTop: 5,
    fontWeight: 'bold',
  },
  interactionText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  detailsButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    paddingVertical: 5,
  },
  adherenceContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  scheduleText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  scheduleEmptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  reminderLink: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  takeDoseButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  takeDoseText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  takenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  takenText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  clearButton: {
    backgroundColor: Colors.light.primary,
    padding: 10,
    borderRadius: 50,
    marginBottom: 10,
    alignItems: 'center',
    alignSelf: 'center',
    width: '50%',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  modalHint: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  modalActions: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
  modalCancelText: {
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  modalSaveButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default SelectedDrugs;
