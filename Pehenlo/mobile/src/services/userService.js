import { api } from './api';

export const userService = {
  getProfile() {
    return api.get('/users/me');
  },

  updateProfile(data) {
    return api.put('/users/profile', data);
  },

  getWishlist: async () => Promise.resolve({ success: true }),
};

export default userService;
