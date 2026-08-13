const express = require('express');
const { sendBookingConfirmation } = require('../controllers/notificationController');

const router = express.Router();
router.post('/booking-confirmation', sendBookingConfirmation);

module.exports = router;