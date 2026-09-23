const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payout', payoutSchema);
