const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, required: true },
    publicId: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
  }
);

const measurementSchema = new mongoose.Schema(
  {
    unit: { type: String, enum: ['inches', 'cm'], default: 'inches' },
    bust: { type: Number, min: 0 },
    chest: { type: Number, min: 0 },
    waist: { type: Number, min: 0 },
    hip: { type: Number, min: 0 },
    shoulder: { type: Number, min: 0 },
    sleeveLength: { type: Number, min: 0 },
    length: { type: Number, min: 0 },
    blouseLength: { type: Number, min: 0 },
    skirtLength: { type: Number, min: 0 },
    notes: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    mode: { type: String, enum: ['ALWAYS', 'MANUAL'], default: 'ALWAYS' },
    blockedDates: { type: [String], default: [] },
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, default: '', maxlength: 100 },
    description: { type: String, trim: true, default: '', maxlength: 1000 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    gender: { type: String, enum: ['female', 'male', 'unisex', 'kids'] },
    brand: { type: String, trim: true, default: '', maxlength: 80 },
    color: { type: String, trim: true, default: '', maxlength: 30 },
    occasion: { type: [String], default: [] },
    images: { type: [imageSchema], default: [] },
    coverImage: { type: String, trim: true, default: '' },
    price: { type: Number, min: 0, default: 0 },
    rentalDuration: { type: Number, min: 1 },
    securityDeposit: { type: Number, min: 0, default: 0 },
    cleaningFee: { type: Number, min: 0, default: 0 },
    deliveryFee: { type: Number, min: 0, default: 0 },
    city: { type: String, trim: true, default: '', index: true },
    state: { type: String, trim: true, default: '' },
    pickupArea: { type: String, trim: true, default: '', maxlength: 80 },
    pickupAvailable: { type: Boolean, default: false },
    deliveryAvailable: { type: Boolean, default: false },
    size: { type: String, trim: true, default: '' },
    measurements: { type: measurementSchema, default: () => ({}) },
    condition: { type: String, enum: ['excellent', 'good', 'fair'] },
    conditionNotes: { type: String, trim: true, default: '', maxlength: 500 },
    hasDamage: { type: Boolean, default: false },
    damageDescription: { type: String, trim: true, default: '', maxlength: 500 },
    availability: { type: availabilitySchema, default: () => ({ mode: 'ALWAYS', blockedDates: [] }) },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    viewCount: { type: Number, default: 0, min: 0 },
    favoriteCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ACTIVE', 'PAUSED'],
      default: 'DRAFT',
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: false, index: true },
    rejectionReason: { type: String, trim: true, default: '', maxlength: 500 },
    sortOrder: { type: Number, default: 0 },
    seedKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

listingSchema.index({ owner: 1, status: 1, updatedAt: -1 });
listingSchema.index({ status: 1, isActive: 1, createdAt: -1 });
listingSchema.index({ status: 1, isActive: 1, isFeatured: 1, sortOrder: 1 });
listingSchema.index({ status: 1, isActive: 1, city: 1 });
listingSchema.index({ status: 1, isActive: 1, gender: 1, price: 1 });
listingSchema.index({ status: 1, isActive: 1, rating: -1 });
listingSchema.index({ status: 1, isActive: 1, favoriteCount: -1, rating: -1 });

module.exports = mongoose.model('Listing', listingSchema);
