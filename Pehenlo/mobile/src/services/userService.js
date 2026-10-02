import { api, BASE_URL, getAuthToken } from './api';

function uploadProfileImage(uri) {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append('image', { uri, name: 'profile.jpg', type: 'image/jpeg' });
    const request = new XMLHttpRequest();
    request.open('POST', `${BASE_URL}/users/me/profile-image`);
    const token = getAuthToken();
    if (token) request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.timeout = 30000;
    request.onerror = () => reject(Object.assign(new Error('Photo upload failed'), { code: 'IMAGE_UPLOAD_FAILED' }));
    request.ontimeout = () => reject(Object.assign(new Error('Photo upload timed out'), { code: 'IMAGE_UPLOAD_FAILED' }));
    request.onload = () => {
      let payload = null;
      try {
        payload = JSON.parse(request.responseText);
      } catch (_error) {
        payload = null;
      }
      if (request.status >= 200 && request.status < 300 && payload?.data) {
        resolve(payload.data);
        return;
      }
      reject(Object.assign(new Error(payload?.message || 'Photo upload failed'), { code: payload?.code || 'IMAGE_UPLOAD_FAILED' }));
    };
    request.send(body);
  });
}

export const userService = {
  getCurrentUser() {
    return api.get('/users/me');
  },

  getProfile() {
    return api.get('/users/me');
  },

  getSummary() {
    return api.get('/users/me/summary');
  },

  updateProfile(data) {
    return api.put('/users/profile', data);
  },

  updateCurrentUser(data) {
    return api.put('/users/me', data);
  },

  uploadProfileImage,

  removeProfileImage() {
    return api.delete('/users/me/profile-image');
  },

  requestAccountDeletion() {
    return api.post('/users/me/delete-request', {});
  },
};

export default userService;
