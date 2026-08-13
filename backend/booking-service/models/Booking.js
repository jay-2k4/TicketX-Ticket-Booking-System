const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    eventId: { type: String, required: true },
    seatNumbers: { type: [String], required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'expired'],
      default: 'pending',
    },
    lockExpiry: { type: Date },
    paymentId: { type: String },
    transactionRef: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);