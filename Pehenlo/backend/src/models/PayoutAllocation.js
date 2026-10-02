const mongoose = require('mongoose');

const payoutAllocationSchema = new mongoose.Schema(
  {
    payout: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout', required: true },
    earning: { type: mongoose.Schema.Types.ObjectId, ref: 'Earning', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

payoutAllocationSchema.index({ payout: 1, earning: 1 }, { unique: true });
payoutAllocationSchema.index({ earning: 1 });
payoutAllocationSchema.index({ seller: 1, payout: 1 });

module.exports = mongoose.model('PayoutAllocation', payoutAllocationSchema);
