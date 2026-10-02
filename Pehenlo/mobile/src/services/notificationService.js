import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { api } from './api';

const PERMISSION_ASKED_KEY = 'pehenlo.notificationPermissionAsked';

let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (_error) {
  Notifications = null;
}

let currentToken = '';

export function getCurrentPushToken() {
  return currentToken;
}

export const notificationApi = {
  getNotifications(params = {}) {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    if (params.category) search.set('category', params.category);
    const query = search.toString();
    return api.get(`/notifications${query ? `?${query}` : ''}`);
  },

  getUnreadCount() {
    return api.get('/notifications/unread-count');
  },

  markNotificationRead(notificationId) {
    return api.patch(`/notifications/${notificationId}/read`, {});
  },

  markAllNotificationsRead() {
    return api.patch('/notifications/read-all', {});
  },

  deleteNotification(notificationId) {
    return api.delete(`/notifications/${notificationId}`);
  },

  getNotificationPreferences() {
    return api.get('/notifications/preferences');
  },

  updateNotificationPreferences(data) {
    return api.put('/notifications/preferences', data);
  },

  registerDeviceToken(data) {
    return api.post('/notifications/devices', data);
  },

  unregisterDeviceToken(token) {
    return api.delete(`/notifications/devices/${encodeURIComponent(token)}`);
  },
};

export async function requestNotificationPermission() {
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain && current.status === 'denied') return false;
  const asked = await AsyncStorage.getItem(PERMISSION_ASKED_KEY);
  if (asked === '1') return false;
  const allow = await new Promise((resolve) => {
    Alert.alert(
      'Stay updated',
      'Pehenlo can alert you about bookings, payments, and payouts. If you skip this, those updates still appear in the app.',
      [
        { text: 'Not now', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continue', onPress: () => resolve(true) },
      ],
      { cancelable: false }
    );
  });
  await AsyncStorage.setItem(PERMISSION_ASKED_KEY, '1');
  if (!allow) return false;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function registerDeviceToken() {
  if (!Notifications) return '';
  const granted = await requestNotificationPermission();
  if (!granted) return '';
  const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  if (!projectId) return '';
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  const value = token?.data || '';
  if (!value) return '';
  const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
  await notificationApi.registerDeviceToken({
    token: value,
    platform,
    appVersion: Constants.expoConfig?.version || '',
  });
  currentToken = value;
  if (platform === 'ANDROID') {
    await Promise.all(['booking', 'payment', 'earning', 'review', 'listing', 'safety', 'account', 'system', 'default'].map((id) => (
      Notifications.setNotificationChannelAsync(id, {
        name: id,
        importance: id === 'payment' || id === 'safety' ? Notifications.AndroidImportance.HIGH : Notifications.AndroidImportance.DEFAULT,
      })
    )));
  }
  return value;
}

export async function unregisterDeviceToken() {
  const token = currentToken;
  currentToken = '';
  if (!token) return;
  try {
    await notificationApi.unregisterDeviceToken(token);
  } catch (_error) {
    currentToken = token;
  }
}

export async function syncBadge(count) {
  if (!Notifications?.setBadgeCountAsync) return;
  try {
    await Notifications.setBadgeCountAsync(Number(count) || 0);
  } catch (_error) {
    // Badge support depends on the device.
  }
}

export function setupNotificationListeners({ onReceive, onResponse }) {
  if (!Notifications) return () => {};
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch (_error) {
    // Foreground presentation is optional. In-app notifications still load from the API.
  }
  const received = Notifications.addNotificationReceivedListener((event) => {
    const content = event?.request?.content || {};
    onReceive?.({ ...(content.data || {}), title: content.title, body: content.body });
  });
  const response = Notifications.addNotificationResponseReceivedListener((event) => {
    onResponse?.(event?.notification?.request?.content?.data || {});
  });
  return () => {
    received.remove();
    response.remove();
  };
}

export async function consumeInitialNotification() {
  if (!Notifications?.getLastNotificationResponseAsync) return null;
  const response = await Notifications.getLastNotificationResponseAsync();
  return response?.notification?.request?.content?.data || null;
}

export default notificationApi;
