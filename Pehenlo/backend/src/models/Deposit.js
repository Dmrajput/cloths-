const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    status: { type: String, enum: ['held', 'released', 'forfeited'], default: 'held' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deposit', depositSchema);
