const BookingEvent = require('../models/BookingEvent');
const logger = require('../utils/logger');

async function recordBookingEvent(bookingId, type, actor = null) {
  try {
    await BookingEvent.create({
      booking: bookingId,
      type,
      actor: actor || null,
      timestamp: new Date(),
    });
  } catch (error) {
    if (error.code === 11000) return;
    logger.warn('booking_event_write_failed', { type });
  }
}

async function recordBookingEvents(entries) {
  if (!entries.length) return;
  try {
    await BookingEvent.insertMany(entries, { ordered: false });
  } catch (error) {
    const writes = error.writeErrors || [];
    const onlyDuplicates = writes.length > 0 && writes.every((item) => item.code === 11000);
    if (error.code === 11000 || onlyDuplicates) return;
    logger.warn('booking_event_write_failed', { type: 'bulk' });
  }
}

async function listBookingEvents(bookingId) {
  return BookingEvent.find({ booking: bookingId }).sort({ timestamp: 1 }).lean();
}

module.exports = {
  recordBookingEvent,
  recordBookingEvents,
  listBookingEvents,
};
