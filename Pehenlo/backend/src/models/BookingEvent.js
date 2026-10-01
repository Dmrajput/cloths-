const mongoose = require('mongoose');

const EVENT_TYPES = [
  'BOOKING_CREATED',
  'OWNER_ACCEPTED',
  'OWNER_REJECTED',
  'PAYMENT_REQUIRED',
  'PAYMENT_COMPLETED',
  'BOOKING_CONFIRMED',
  'BOOKING_CANCELLED',
  'BOOKING_EXPIRED',
  'RENTAL_STARTED',
  'RETURN_PENDING',
  'BOOKING_COMPLETED',
  'DISPUTED',
];

const bookingEventSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    type: { type: String, enum: EVENT_TYPES, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    timestamp: { type: Date, required: true },
    metadata: { type: Object, default: undefined },
  },
  { timestamps: false }
);

bookingEventSchema.index({ booking: 1, type: 1 }, { unique: true });
bookingEventSchema.index({ booking: 1, timestamp: 1 });

module.exports = mongoose.model('BookingEvent', bookingEventSchema);
