const axios = require('axios');
const Booking = require('../models/Booking');

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL;

// @route  POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { userId, eventId, seatNumbers, pricePerSeat } = req.body;

    if (!userId || !eventId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: 'userId, eventId and seatNumbers are required' });
    }

    let lockResponse;
    try {
      lockResponse = await axios.patch(
        `${EVENT_SERVICE_URL}/api/events/${eventId}/seats/lock`,
        { seatNumbers, userId }
      );
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).json(err.response.data);
      }
      return res.status(502).json({ message: 'Could not reach event service' });
    }

    const { lockExpiry } = lockResponse.data;
    const totalAmount = (pricePerSeat || 0) * seatNumbers.length;

    const booking = await Booking.create({
      userId,
      eventId,
      seatNumbers,
      totalAmount,
      status: 'pending',
      lockExpiry,
    });

    res.status(201).json({
      message: 'Seats locked - complete payment before the hold expires',
      booking,
      lockExpiry,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PATCH /api/bookings/:id/confirm
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    try {
      await axios.patch(
        `${EVENT_SERVICE_URL}/api/events/${booking.eventId}/seats/confirm`,
        { seatNumbers: booking.seatNumbers, userId: booking.userId }
      );
    } catch (err) {
      if (err.response) {
        return res.status(err.response.status).json(err.response.data);
      }
      return res.status(502).json({ message: 'Could not reach event service' });
    }

    booking.status = 'confirmed';
    booking.paymentId = req.body.paymentId;
    booking.transactionRef = req.body.transactionRef;
    await booking.save();

    res.status(200).json({ message: 'Booking confirmed successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PATCH /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    try {
      await axios.patch(
        `${EVENT_SERVICE_URL}/api/events/${booking.eventId}/seats/release`,
        { seatNumbers: booking.seatNumbers, userId: booking.userId }
      );
    } catch (err) {
      // even if event-service call fails, still mark booking cancelled on our side
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/bookings/user/:userId
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};