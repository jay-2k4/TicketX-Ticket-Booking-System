const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ['card', 'upi', 'wallet', 'netbanking'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    transactionRef: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);