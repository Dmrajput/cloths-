const mongoose = require('mongoose');

const deliveryAddressSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    addressLine1: { type: String, trim: true, default: '' },
    addressLine2: { type: String, trim: true, default: '' },
    area: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    pincode: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const STATUSES = [
  'PENDING_OWNER_APPROVAL',
  'PAYMENT_REQUIRED',
  'CONFIRMED',
  'REJECTED',
  'CANCELLED',
  'ACTIVE',
  'RETURN_PENDING',
  'COMPLETED',
  'DISPUTED',
  'EXPIRED',
];

const PAYMENT_STATUSES = [
  'NOT_STARTED',
  'PENDING',
  'PROCESSING',
  'PAID',
  'FAILED',
  'EXPIRED',
  'REFUND_PENDING',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
];

const bookingSchema = new mongoose.Schema(
  {
    renter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    listingTitle: { type: String, trim: true, default: '' },
    listingCoverImage: { type: String, trim: true, default: '' },
    listingSnapshot: {
      type: new mongoose.Schema(
        {
          title: { type: String, trim: true, default: '' },
          coverImage: { type: String, trim: true, default: '' },
          category: { type: String, trim: true, default: '' },
          size: { type: String, trim: true, default: '' },
          color: { type: String, trim: true, default: '' },
          city: { type: String, trim: true, default: '' },
        },
        { _id: false }
      ),
      default: undefined,
    },
    bookingReference: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentalDays: { type: Number, required: true, min: 1 },
    rentalPeriods: { type: Number, required: true, min: 1 },
    rentalPricePerPeriod: { type: Number, required: true, min: 0 },
    rentalSubtotal: { type: Number, required: true, min: 0 },
    cleaningFee: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },
    totalBeforeDeposit: { type: Number, required: true, min: 0 },
    totalIncludingDeposit: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    fulfillmentMethod: { type: String, enum: ['PICKUP', 'DELIVERY'], required: true },
    pickupArea: { type: String, trim: true, default: '' },
    deliveryAddress: { type: deliveryAddressSchema, default: null },
    status: { type: String, enum: STATUSES, default: 'PENDING_OWNER_APPROVAL' },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'NOT_STARTED' },
    paymentDueAt: { type: Date, default: null },
    paymentCompletedAt: { type: Date, default: null },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    razorpayOrderId: { type: String, trim: true, default: '' },
    paymentFailureReason: { type: String, trim: true, default: '', maxlength: 300 },
    renterNote: { type: String, trim: true, default: '', maxlength: 500 },
    ownerNote: { type: String, trim: true, default: '', maxlength: 500 },
    rejectedReason: { type: String, trim: true, default: '', maxlength: 500 },
    cancelledReason: { type: String, trim: true, default: '', maxlength: 500 },
    bookingExpiresAt: { type: Date, default: null },
    requestedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    paymentRequiredAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    expiredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ listing: 1, status: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ renter: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, createdAt: -1 });
bookingSchema.index({ renter: 1, status: 1, createdAt: -1 });
bookingSchema.index({ owner: 1, status: 1, createdAt: -1 });
bookingSchema.index(
  { bookingReference: 1 },
  { unique: true, partialFilterExpression: { bookingReference: { $gt: '' } } }
);
bookingSchema.index({ status: 1, bookingExpiresAt: 1 });
bookingSchema.index({ status: 1, paymentDueAt: 1 });
bookingSchema.index({ paymentStatus: 1, paymentDueAt: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
