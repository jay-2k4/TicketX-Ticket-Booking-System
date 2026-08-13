const express = require('express');
const router = express.Router();
const {
  createBooking,
  confirmBooking,
  cancelBooking,
  getMyBookings,
  getBookingById,
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.patch('/:id/confirm', confirmBooking);
router.patch('/:id/cancel', cancelBooking);
router.get('/user/:userId', getMyBookings);
router.get('/:id', getBookingById);

module.exports = router;