const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    bookingId: { type: String, required: true },
    type: { type: String, default: 'booking-confirmation' },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);