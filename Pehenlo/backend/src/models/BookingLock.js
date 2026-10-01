const mongoose = require('mongoose');

const bookingLockSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, unique: true },
  lockedAt: { type: Date, required: true },
  token: { type: mongoose.Schema.Types.ObjectId, required: true },
});

module.exports = mongoose.model('BookingLock', bookingLockSchema);
