import { api } from './api';

function query(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

export const bookingService = {
  checkAvailability(listingId, startDate, endDate) {
    return api.get(`/listings/${listingId}/availability${query({ startDate, endDate })}`);
  },

  getAvailabilityCalendar(listingId, month) {
    return api.get(`/listings/${listingId}/availability/calendar${query({ month })}`);
  },

  getBookingPrice(listingId, body) {
    return api.post(`/listings/${listingId}/booking-price`, body);
  },

  createBooking(body) {
    return api.post('/bookings', body);
  },

  getMyBookings(params) {
    return api.get(`/bookings/my${query(params)}`);
  },

  getRentalCounts() {
    return api.get('/bookings/my/counts');
  },

  getBookingById(bookingId) {
    return api.get(`/bookings/${bookingId}`);
  },

  acceptBooking(bookingId, body = {}) {
    return api.post(`/bookings/${bookingId}/accept`, body);
  },

  rejectBooking(bookingId, body = {}) {
    return api.post(`/bookings/${bookingId}/reject`, body);
  },

  cancelBooking(bookingId, body = {}) {
    return api.post(`/bookings/${bookingId}/cancel`, body);
  },
};
