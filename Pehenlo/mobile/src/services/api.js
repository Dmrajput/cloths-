import Constants from 'expo-constants';

const CONFIGURED_API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  'http://localhost:5000/api/v1';

/**
 * A physical phone cannot reach the computer through localhost.
 * In Expo Go, reuse the same host Metro is already using.
 */
function resolveBaseUrl(configuredUrl) {
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (!devHost) return configuredUrl;

  try {
    const url = new URL(configuredUrl);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.hostname = devHost;
      return url.toString().replace(/\/$/, '');
    }
  } catch (_error) {
    return configuredUrl;
  }

  return configuredUrl;
}

export const BASE_URL = resolveBaseUrl(CONFIGURED_API_URL);

const REQUEST_TIMEOUT_MS = 15000;

let authToken = null;
let unauthorizedHandler = null;

export function setAuthToken(token) {
  authToken = token || null;
}

export function getAuthToken() {
  return authToken;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function networkError() {
  const message = __DEV__
    ? `Unable to connect to ${BASE_URL}. Use the same Wi-Fi as this computer and make sure the API is running.`
    : 'Unable to connect. Please check your internet connection and try again.';
  const error = new Error(message);
  error.code = 'NETWORK_ERROR';
  return error;
}

export async function apiRequest(method, endpoint, body, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (_error) {
      payload = null;
    }

    if (!response.ok) {
      const error = new Error(payload?.message || 'Something went wrong. Please try again.');
      error.code = payload?.code || 'SERVER_ERROR';
      error.status = response.status;

      if (
        !options.skipAuthHandler
        && response.status === 401
        && typeof unauthorizedHandler === 'function'
      ) {
        unauthorizedHandler();
      }

      throw error;
    }

    return payload;
  } catch (error) {
    if (error?.name === 'AbortError' || error?.message === 'Network request failed') {
      throw networkError();
    }
    if (error?.code) {
      throw error;
    }
    throw networkError();
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: (endpoint, options) => apiRequest('GET', endpoint, undefined, options),
  post: (endpoint, body, options) => apiRequest('POST', endpoint, body, options),
  put: (endpoint, body, options) => apiRequest('PUT', endpoint, body, options),
  delete: (endpoint, options) => apiRequest('DELETE', endpoint, undefined, options),
};

export default api;
