/**
 * API client placeholder for Pehenlo.
 * No backend calls are made in Phase 1.
 */
import Constants from 'expo-constants';

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  'http://localhost:5000/api/v1';

/**
 * Placeholder fetch helper — not used by screens in Phase 1.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  return response;
}

export default {
  BASE_URL,
  apiFetch,
};
