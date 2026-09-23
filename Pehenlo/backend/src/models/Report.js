const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetType: { type: String, enum: ['listing', 'user', 'review'] },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    reason: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
