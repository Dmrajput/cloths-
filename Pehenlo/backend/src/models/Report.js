const mongoose = require('mongoose');

const TARGETS = ['LISTING', 'USER', 'REVIEW', 'BOOKING'];
const REASONS = [
  'INAPPROPRIATE_CONTENT',
  'MISLEADING_LISTING',
  'FAKE_REVIEW',
  'FRAUD_SUSPICION',
  'HARASSMENT',
  'ABUSIVE_BEHAVIOR',
  'SCAM',
  'COUNTERFEIT_ITEM',
  'PROHIBITED_ITEM',
  'SAFETY_CONCERN',
  'OTHER',
];
const STATUSES = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: TARGETS, required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    reason: { type: String, enum: REASONS, required: true },
    description: { type: String, trim: true, default: '', maxlength: 1000 },
    status: { type: String, enum: STATUSES, default: 'OPEN' },
    priority: { type: String, enum: ['NORMAL', 'HIGH'], default: 'NORMAL' },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reportSchema.index({ targetType: 1, targetId: 1, status: 1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ reporter: 1, targetType: 1, targetId: 1 });

module.exports = mongoose.model('Report', reportSchema);
module.exports.REPORT_TARGETS = TARGETS;
module.exports.REPORT_REASONS = REASONS;
module.exports.REPORT_STATUSES = STATUSES;
