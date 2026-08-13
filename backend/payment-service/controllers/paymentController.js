const axios = require('axios');
const Payment = require('../models/payment');

const VALID_METHODS = ['card', 'upi', 'wallet', 'netbanking'];

exports.payForBooking = async (req, res) => {
  try {
    const { bookingId, amount, method, details = {} } = req.body;
    const userId = req.user.id;

    if (!bookingId || !amount || !VALID_METHODS.includes(method)) {
      return res.status(400).json({ error: 'bookingId, amount and a valid method are required' });
    }

    // ---- Mock gateway logic ----
    // Card ending in 0000 = simulated decline, so you can demo the failure path
    let success = true;
    if (method === 'card' && details.cardNumber?.replace(/\s/g, '').endsWith('0000')) {
      success = false;
    }

    const transactionRef = `PAY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

    const payment = await Payment.create({
      bookingId,
      userId,
      amount,
      method,
      status: success ? 'success' : 'failed',
      transactionRef,
    });

    if (!success) {
      return res.status(402).json({ error: 'Payment declined by gateway', payment });
    }

    // ---- Tell booking-service to confirm the booking ----
    try {
      await axios.patch(
        `${process.env.BOOKING_SERVICE_URL}/api/bookings/${bookingId}/confirm`,
        { paymentId: payment._id, transactionRef },
        { headers: { Authorization: req.headers.authorization } }
      );
    } catch (err) {
      console.error('⚠️ Failed to confirm booking:', err.message);
      // Payment succeeded but booking confirm failed — flag for manual reconciliation
      return res.status(207).json({
        warning: 'Payment succeeded but booking confirmation failed. Contact support.',
        payment,
      });
    }

    // ---- Fire-and-forget notification (don't block the payment response) ----
    axios
      .post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/booking-confirmation`, {
        userId,
        bookingId,
        amount,
        transactionRef,
      })
      .catch((err) => console.error('⚠️ Notification trigger failed:', err.message));

    res.json({ success: true, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment processing failed' });
  }
};

exports.getPaymentByBooking = async (req, res) => {
  const payment = await Payment.findOne({ bookingId: req.params.bookingId }).sort({ createdAt: -1 });
  if (!payment) return res.status(404).json({ error: 'No payment found for this booking' });
  res.json(payment);
};
