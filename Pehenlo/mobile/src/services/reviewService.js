import { api } from './api';

export const reviewService = {
  createReview(data) {
    return api.post('/reviews', data);
  },

  getReview(reviewId) {
    return api.get(`/reviews/${reviewId}`);
  },

  updateReview(reviewId, data) {
    return api.put(`/reviews/${reviewId}`, data);
  },

  deleteReview(reviewId) {
    return api.delete(`/reviews/${reviewId}`);
  },

  getListingReviews(listingId, params = {}) {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    if (params.limit) search.set('limit', String(params.limit));
    if (params.rating) search.set('rating', String(params.rating));
    if (params.sort) search.set('sort', params.sort);
    const query = search.toString();
    return api.get(`/listings/${listingId}/reviews${query ? `?${query}` : ''}`);
  },

  getListingReviewSummary(listingId) {
    return api.get(`/listings/${listingId}/review-summary`);
  },

  getOwnerReviews(userId, params = {}) {
    const search = new URLSearchParams();
    if (params.page) search.set('page', String(params.page));
    const query = search.toString();
    return api.get(`/users/${userId}/reviews${query ? `?${query}` : ''}`);
  },
};

export default reviewService;
