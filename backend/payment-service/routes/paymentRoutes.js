const express = require('express');
const { authRequired } = require('../middleware/auth');
const { payForBooking, getPaymentByBooking } = require('../controllers/paymentController');

const router = express.Router();

router.post('/pay', authRequired, payForBooking);
router.get('/booking/:bookingId', authRequired, getPaymentByBooking);

module.exports = router;