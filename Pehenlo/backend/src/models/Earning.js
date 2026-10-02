const mongoose = require('mongoose');

const earningSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    bookingReference: { type: String, trim: true, default: '' },
    earningType: { type: String, enum: ['RENTAL', 'ADJUSTMENT'], default: 'RENTAL' },
    rentalSubtotal: { type: Number, required: true, min: 0 },
    cleaningFee: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    grossRentalAmount: { type: Number, required: true, min: 0 },
    commissionRate: { type: Number, required: true, min: 0 },
    commissionAmount: { type: Number, required: true, min: 0 },
    otherAdjustments: { type: Number, required: true, default: 0 },
    netEarning: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['PENDING', 'AVAILABLE', 'PAYOUT_PENDING', 'PAID', 'CANCELLED', 'ADJUSTED'],
      default: 'PENDING',
    },
    availableAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    payout: { type: mongoose.Schema.Types.ObjectId, ref: 'Payout', default: null },
    payoutReference: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

earningSchema.index({ seller: 1, status: 1, createdAt: -1 });
earningSchema.index({ seller: 1, availableAt: 1, status: 1 });
earningSchema.index({ payment: 1 });
earningSchema.index({ booking: 1, earningType: 1 }, { unique: true });

module.exports = mongoose.model('Earning', earningSchema);
