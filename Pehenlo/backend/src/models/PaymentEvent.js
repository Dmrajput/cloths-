const mongoose = require('mongoose');

const paymentEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentEvent', paymentEventSchema);
