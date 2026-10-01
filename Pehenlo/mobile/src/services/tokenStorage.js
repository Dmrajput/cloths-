import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { TOKEN_STORAGE_KEY } from '../constants/appConstants';

const memoryStore = new Map();

export async function saveAccessToken(token) {
  if (Platform.OS === 'web') {
    memoryStore.set(TOKEN_STORAGE_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
}

export async function readAccessToken() {
  if (Platform.OS === 'web') {
    return memoryStore.get(TOKEN_STORAGE_KEY) || null;
  }
  return SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
}

export async function clearAccessToken() {
  if (Platform.OS === 'web') {
    memoryStore.delete(TOKEN_STORAGE_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
}
