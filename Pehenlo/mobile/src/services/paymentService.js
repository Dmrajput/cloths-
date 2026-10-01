import { api } from './api';

export const paymentService = {
  createPaymentOrder(bookingId) {
    return api.post('/payments/create-order', { bookingId });
  },

  verifyPayment(body) {
    return api.post('/payments/verify', body);
  },

  getBookingPaymentStatus(bookingId) {
    return api.get(`/payments/booking/${bookingId}`);
  },
};
