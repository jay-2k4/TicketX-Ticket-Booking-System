const axios = require('axios');
const Booking = require('../models/Booking');

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL;
const SWEEP_INTERVAL_MS = 60 * 1000; // run every 1 minute

async function sweepExpiredBookings() {
  const now = new Date();

  const expired = await Booking.find({
    status: 'pending',
    lockExpiry: { $lt: now },
  });

  if (expired.length === 0) return;

  console.log(`⏰ Sweeping ${expired.length} expired booking(s)...`);

  for (const booking of expired) {
    try {
      await axios.patch(
        `${EVENT_SERVICE_URL}/api/events/${booking.eventId}/seats/release`,
        { seatNumbers: booking.seatNumbers, userId: booking.userId }
      );
    } catch (err) {
      console.error(`⚠️ Could not release seats for booking ${booking._id}:`, err.message);
      // still mark it expired on our side — don't let a dead event-service block cleanup
    }

    booking.status = 'expired';
    await booking.save();
  }
}

function startExpirySweeper() {
  setInterval(sweepExpiredBookings, SWEEP_INTERVAL_MS);
  console.log('🧹 Booking expiry sweeper started (runs every 60s)');
}

module.exports = { startExpirySweeper };