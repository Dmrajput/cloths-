import { api } from './api';

export const safetyService = {
  reportTarget(data) {
    return api.post('/reports', data);
  },

  getMyReports() {
    return api.get('/reports/my');
  },

  blockUser(userId) {
    return api.post(`/users/${userId}/block`, {});
  },

  unblockUser(userId) {
    return api.delete(`/users/${userId}/block`);
  },

  getBlockedUsers() {
    return api.get('/users/blocked');
  },

  getPublicUserProfile(userId) {
    return api.get(`/users/${userId}/public`);
  },
};

export default safetyService;
