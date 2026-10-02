const mongoose = require('mongoose');

const payoutAccountSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    accountHolderName: { type: String, trim: true, required: true, maxlength: 80 },
    bankName: { type: String, trim: true, required: true, maxlength: 80 },
    accountNumber: { type: String, trim: true, required: true, maxlength: 18 },
    ifsc: { type: String, trim: true, required: true, uppercase: true, maxlength: 11 },
    status: {
      type: String,
      enum: ['NOT_CONFIGURED', 'PENDING_VERIFICATION', 'VERIFIED', 'FAILED'],
      default: 'PENDING_VERIFICATION',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PayoutAccount', payoutAccountSchema);
