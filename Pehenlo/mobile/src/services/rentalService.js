import { paymentService } from './paymentService';
import { bookingService } from './bookingService';

export const rentalService = {
  getMyRentals(params = {}) {
    return bookingService.getMyBookings({ ...params, role: 'renter' });
  },

  getMyOutfitRentals(params = {}) {
    return bookingService.getMyBookings({ ...params, role: 'owner' });
  },

  getBookingDetails(bookingId) {
    return bookingService.getBookingById(bookingId);
  },

  cancelBooking(bookingId) {
    return bookingService.cancelBooking(bookingId);
  },

  acceptBooking(bookingId) {
    return bookingService.acceptBooking(bookingId);
  },

  rejectBooking(bookingId, reason = '') {
    return bookingService.rejectBooking(bookingId, reason ? { reason } : {});
  },

  getBookingPaymentStatus(bookingId) {
    return paymentService.getBookingPaymentStatus(bookingId);
  },

  getCounts() {
    return bookingService.getRentalCounts();
  },
};
