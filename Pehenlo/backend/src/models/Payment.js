const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
