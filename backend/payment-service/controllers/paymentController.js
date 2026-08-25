const axios = require('axios');
const Payment = require('../models/payment');

const VALID_METHODS = ['card', 'upi', 'wallet', 'netbanking'];

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function wakeNotificationService() {
  const url = process.env.NOTIFICATION_SERVICE_URL;

  if (!url) {
    throw new Error('NOTIFICATION_SERVICE_URL is not configured');
  }

  const maxAttempts = 6;
  const delay = 15000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.get(`${url}/health`, {
        timeout: 30000,
      });

      if (response.status === 200) {
        console.log('📧 Notification service is awake');
        return true;
      }

      console.log(
        `📧 Notification service returned ${response.status}. Attempt ${attempt}/${maxAttempts}`
      );
    } catch (error) {
      console.log(
        `📧 Notification service is waking up. Attempt ${attempt}/${maxAttempts}`
      );
    }

    if (attempt < maxAttempts) {
      await sleep(delay);
    }
  }

  throw new Error('Notification service could not be awakened');
}

exports.payForBooking = async (req, res) => {
  try {
    const { bookingId, amount, method, details = {} } = req.body;
    const userId = req.user.id;

    if (!bookingId || !amount || !VALID_METHODS.includes(method)) {
      return res.status(400).json({
        error: 'bookingId, amount and a valid method are required',
      });
    }

    // ---- Mock payment gateway logic ----
    let success = true;

    if (
      method === 'card' &&
      details.cardNumber?.replace(/\s/g, '').endsWith('0000')
    ) {
      success = false;
    }

    const transactionRef = `PAY-${Math.random()
      .toString(36)
      .slice(2, 10)
      .toUpperCase()}`;

    const payment = await Payment.create({
      bookingId,
      userId,
      amount,
      method,
      status: success ? 'success' : 'failed',
      transactionRef,
    });

    if (!success) {
      return res.status(402).json({
        error: 'Payment declined by gateway',
        payment,
      });
    }

    // ---- Confirm booking ----
    try {
      await axios.patch(
        `${process.env.BOOKING_SERVICE_URL}/api/bookings/${bookingId}/confirm`,
        {
          paymentId: payment._id,
          transactionRef,
        },
        {
          headers: {
            Authorization: req.headers.authorization,
          },
        }
      );

      console.log('✅ Booking confirmed');
    } catch (err) {
      console.error(
        '⚠️ Failed to confirm booking:',
        err.response?.data || err.message
      );

      return res.status(207).json({
        warning:
          'Payment succeeded but booking confirmation failed. Contact support.',
        payment,
      });
    }

    // ---- Wake Notification Service and send email ----
    try {
      await wakeNotificationService();

      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/booking-confirmation`,
        {
          userId,
          bookingId,
          amount,
          transactionRef,
        },
        {
          timeout: 30000,
        }
      );

      console.log('📧 Booking confirmation notification sent');
    } catch (err) {
      console.error(
        '⚠️ Notification failed:',
        err.response?.data || err.message
      );
    }

    res.json({
      success: true,
      payment,
    });
  } catch (err) {
    console.error('❌ Payment processing failed:', err);

    res.status(500).json({
      error: 'Payment processing failed',
    });
  }
};

exports.getPaymentByBooking = async (req, res) => {
  const payment = await Payment.findOne({
    bookingId: req.params.bookingId,
  }).sort({ createdAt: -1 });

  if (!payment) {
    return res.status(404).json({
      error: 'No payment found for this booking',
    });
  }

  res.json(payment);
};