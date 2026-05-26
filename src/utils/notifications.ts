/**
 * @file Wraps push notification setup and reminder scheduling helpers.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

const DEFAULT_CHANNEL_ID = 'default';

/**
 * Configures Android notification channel used for medication reminders.
 */
const configureAndroidChannel = async () => {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
    name: DEFAULT_CHANNEL_ID,
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
};

/**
 * Requests notification permission and returns whether it was granted.
 */
const requestNotificationPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Registers notification capabilities for the current platform.
 */
export async function registerForPushNotificationsAsync() {
  await configureAndroidChannel();

  if (!Device.isDevice) {
    return false;
  }

  const isGranted = await requestNotificationPermission();
  if (!isGranted) {
    console.warn('Failed to get push token for push notification!');
  }

  return isGranted;
}

/**
 * Schedules a daily reminder notification for a given medication.
 */
export async function scheduleDrugReminder(drugName: string, hour: number, minute: number) {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Time for your medication \uD83D\uDC8A",
      body: `It's time to take your ${drugName}.`,
      data: { drugName },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/**
 * Cancels all scheduled medication reminders for the app.
 */
export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
