const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payoutReference: { type: String, trim: true, required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['REQUESTED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED'],
      default: 'REQUESTED',
    },
    payoutMethod: { type: String, trim: true, default: 'BANK' },
    payoutAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'PayoutAccount', default: null },
    providerPayoutId: { type: String, trim: true, default: '' },
    failureReason: { type: String, trim: true, default: '', maxlength: 300 },
    requestedAt: { type: Date, default: null },
    processedAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

payoutSchema.index({ seller: 1, status: 1, createdAt: -1 });
payoutSchema.index({ payoutReference: 1 }, { unique: true });

module.exports = mongoose.model('Payout', payoutSchema);
