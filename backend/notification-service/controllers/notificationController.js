const axios = require('axios');
const transporter = require('../config/mailer');
const Notification = require('../models/Notification');

exports.sendBookingConfirmation = async (req, res) => {
  const { userId, bookingId, amount, transactionRef } = req.body;

  try {
    // Get the user's email from user-service
    const { data: user } = await axios.get(
      `${process.env.USER_SERVICE_URL || 'http://localhost:5001'}/api/auth/user/${userId}`
    );

    await transporter.sendMail({
      from: `"TicketX" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Your TicketX booking is confirmed! 🎟️',
      html: `
        <h2>Booking Confirmed</h2>
        <p>Hi ${user.name},</p>
        <p>Your booking <b>${bookingId}</b> is confirmed.</p>
        <p>Amount paid: ₹${amount}</p>
        <p>Transaction ref: ${transactionRef}</p>
        <p>Thanks for booking with TicketX!</p>
      `,
    });

    await Notification.create({ userId, bookingId, status: 'sent' });
    res.json({ success: true });
  } catch (err) {
    console.error('Notification failed:', err.message);
    await Notification.create({ userId, bookingId, status: 'failed' });
    res.status(500).json({ error: 'Failed to send notification' });
  }
};