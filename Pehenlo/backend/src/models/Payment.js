const mongoose = require('mongoose');

const PAYMENT_STATUSES = [
  'INITIATED',
  'ORDER_CREATED',
  'PAYMENT_PROCESSING',
  'PAID',
  'FAILED',
  'EXPIRED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
];

const OPEN_STATUSES = ['INITIATED', 'ORDER_CREATED', 'PAYMENT_PROCESSING'];

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    razorpayOrderId: { type: String, trim: true },
    razorpayPaymentId: { type: String, trim: true },
    razorpaySignature: { type: String, trim: true, default: '' },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'INITIATED' },
    method: { type: String, trim: true, default: '' },
    failureReason: { type: String, trim: true, default: '', maxlength: 300 },
    paidAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: undefined },
  },
  { timestamps: true }
);

paymentSchema.index(
  { booking: 1 },
  { unique: true, partialFilterExpression: { status: { $in: OPEN_STATUSES } } }
);
paymentSchema.index(
  { razorpayOrderId: 1 },
  { unique: true, partialFilterExpression: { razorpayOrderId: { $gt: '' } } }
);
paymentSchema.index(
  { razorpayPaymentId: 1 },
  { unique: true, partialFilterExpression: { razorpayPaymentId: { $gt: '' } } }
);
paymentSchema.index({ renter: 1, createdAt: -1 });
paymentSchema.index({ owner: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
module.exports.OPEN_PAYMENT_STATUSES = OPEN_STATUSES;
