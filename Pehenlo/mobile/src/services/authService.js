import { api } from './api';

export const authService = {
  sendOTP(phone) {
    return api.post('/auth/send-otp', { phone });
  },

  verifyOTP(phone, otp) {
    return api.post('/auth/verify-otp', { phone, otp });
  },

  getCurrentUser() {
    return api.get('/auth/me', { skipAuthHandler: true });
  },

  logout() {
    return api.post('/auth/logout', {}, { skipAuthHandler: true });
  },
};

export default authService;
