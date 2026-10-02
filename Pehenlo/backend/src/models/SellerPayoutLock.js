const mongoose = require('mongoose');

const sellerPayoutLockSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  lockedAt: { type: Date, required: true },
  token: { type: mongoose.Schema.Types.ObjectId, required: true },
});

module.exports = mongoose.model('SellerPayoutLock', sellerPayoutLockSchema);
