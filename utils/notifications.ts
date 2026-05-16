// utils/notifications.ts — KILO Notification Engine (Expo Go Safe Version)

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * Lazy-load Notifications to prevent SDK 53+ crashes in Expo Go.
 * This ensures the library is only accessed if we are NOT in the Expo Go environment.
 */
function getNotifications() {
  if (Constants.appOwnership === 'expo') {
    return null;
  }
  return require('expo-notifications');
}

// Only set the handler if not in Expo Go
const Notifications = getNotifications();
if (Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn('Notifications handler could not be set:', e);
  }
}

export async function requestNotificationPermissions() {
  const Notifications = getNotifications();
  if (!Notifications) {
    console.log('Notifications are disabled in Expo Go preview.');
    return false;
  }

  try {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });
    }

    return true;
  } catch (e) {
    console.warn('Error requesting notification permissions:', e);
    return false;
  }
}

export async function scheduleDailyReminder(hour: number = 9, minute: number = 0) {
  const Notifications = getNotifications();
  if (!Notifications) return null;

  try {
    // Clear existing reminders first
    await cancelAllReminders();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Good Morning! 🏋️",
        body: "Time to log your weight for today. Stay consistent with KILO!",
        data: { screen: 'home' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour,
        minute,
        repeats: true,
      },
    });

    return id;
  } catch (e) {
    console.warn('Error scheduling notification:', e);
    return null;
  }
}

export async function cancelAllReminders() {
  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    console.warn('Error cancelling notifications:', e);
  }
}
