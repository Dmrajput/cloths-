import { api } from './api';

export const listingService = {
  getCategories() {
    return api.get('/categories?active=true');
  },

  getFeaturedListings() {
    return api.get('/listings/featured');
  },

  getTrendingListings() {
    return api.get('/listings/trending');
  },

  getNearbyListings(params = {}) {
    const city = params.city ? `?city=${encodeURIComponent(params.city)}` : '';
    return api.get(`/listings/nearby${city}`);
  },

  getRecentListings() {
    return api.get('/listings/recent');
  },

  getListings(params = {}) {
    const query = new URLSearchParams(params).toString();
    return api.get(query ? `/listings?${query}` : '/listings');
  },

  getListingById(listingId) {
    return api.get(`/listings/${listingId}`);
  },

  createListing(payload) {
    return api.post('/listings', payload);
  },

  updateListing(listingId, payload) {
    return api.put(`/listings/${listingId}`, payload);
  },

  submitListing(listingId) {
    return api.post(`/listings/${listingId}/submit`, {});
  },

  getMyListings() {
    return api.get('/listings/my');
  },

  getMyDrafts() {
    return api.get('/listings/my/drafts');
  },

  getMyListing(listingId) {
    return api.get(`/listings/my/${listingId}`);
  },

  getSimilarListings(listingId) {
    return api.get(`/listings/${listingId}/similar`);
  },

  trackListingView(listingId) {
    return api.post(`/listings/${listingId}/view`, {});
  },

  deleteListing(listingId) {
    return api.delete(`/listings/${listingId}`);
  },
};

export default listingService;
