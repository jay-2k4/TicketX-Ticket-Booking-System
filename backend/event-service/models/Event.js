const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatNumber: { type: String, required: true }, // e.g. "A1"
    row: { type: String, required: true }, // e.g. "A"
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
    },
    lockedBy: { type: String, default: null },
    lockExpiry: { type: Date, default: null },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    category: {
      type: String,
      default: 'general',
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: 1,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    seats: [seatSchema],
    createdBy: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);