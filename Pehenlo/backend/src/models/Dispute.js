const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
    status: { type: String, enum: ['open', 'resolved', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
