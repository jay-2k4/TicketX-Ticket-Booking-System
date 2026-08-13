const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  getSeats,
  lockSeats,
  confirmSeats,
  releaseSeats,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');

router.post('/', createEvent);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.get('/:id/seats', getSeats);
router.patch('/:id/seats/lock', lockSeats);
router.patch('/:id/seats/confirm', confirmSeats);
router.patch('/:id/seats/release', releaseSeats);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;