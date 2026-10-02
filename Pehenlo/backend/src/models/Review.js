const mongoose = require('mongoose');

const TYPES = ['OUTFIT_REVIEW', 'OWNER_REVIEW', 'RENTER_REVIEW'];
const STATUSES = ['PENDING_MODERATION', 'PUBLISHED', 'HIDDEN', 'REJECTED', 'DELETED'];

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    type: { type: String, enum: TYPES, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, default: '', maxlength: 100 },
    comment: { type: String, trim: true, default: '', maxlength: 1000 },
    status: { type: String, enum: STATUSES, default: 'PUBLISHED' },
    isVerifiedRental: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0, min: 0 },
    helpfulCount: { type: Number, default: 0, min: 0 },
    publishedAt: { type: Date, default: null },
    hiddenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reviewSchema.index({ booking: 1, reviewer: 1, type: 1 }, { unique: true });
reviewSchema.index({ listing: 1, status: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ reviewee: 1, type: 1, status: 1 });

module.exports = mongoose.model('Review', reviewSchema);
module.exports.REVIEW_TYPES = TYPES;
module.exports.REVIEW_STATUSES = STATUSES;
