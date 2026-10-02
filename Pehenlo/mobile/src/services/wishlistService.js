import { api } from './api';

export const wishlistService = {
  getWishlist(params = {}) {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    const query = search.toString();
    return api.get(`/wishlist${query ? `?${query}` : ''}`);
  },

  getWishlistIds() {
    return api.get('/wishlist/ids');
  },

  checkWishlist(listingId) {
    return api.get(`/wishlist/check/${listingId}`);
  },

  addToWishlist(listingId) {
    return api.post(`/wishlist/${listingId}`, {});
  },

  removeFromWishlist(listingId) {
    return api.delete(`/wishlist/${listingId}`);
  },

  getWishlistCount() {
    return api.get('/wishlist/count');
  },
};

export default wishlistService;
