const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    pricePerDay: { type: Number },
    status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
