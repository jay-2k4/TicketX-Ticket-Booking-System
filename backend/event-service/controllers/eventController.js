const Event = require('../models/Event');

// Auto-generates a seat map: rows A, B, C... with 10 seats per row
function generateSeats(totalSeats) {
  const seats = [];
  const seatsPerRow = 10;
  const rows = Math.ceil(totalSeats / seatsPerRow);
  let seatCount = 0;

  for (let r = 0; r < rows; r++) {
    const rowLabel = String.fromCharCode(65 + r); // A, B, C...
    for (let s = 1; s <= seatsPerRow; s++) {
      if (seatCount >= totalSeats) break;
      seats.push({
        seatNumber: `${rowLabel}${s}`,
        row: rowLabel,
        status: 'available',
        lockedBy: null,
        lockExpiry: null,
      });
      seatCount++;
    }
  }
  return seats;
}

// @route  POST /api/events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, venue, date, category, totalSeats, price, createdBy } = req.body;

    if (!title || !venue || !date || !totalSeats || !price) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const seats = generateSeats(totalSeats);

    const event = await Event.create({
      title,
      description,
      venue,
      date,
      category,
      totalSeats,
      availableSeats: totalSeats,
      price,
      seats,
      createdBy,
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/events
exports.getEvents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const events = await Event.find(filter).select('-seats').sort({ date: 1 });
    res.status(200).json({ count: events.length, events });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/events/:id
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  GET /api/events/:id/seats
exports.getSeats = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('title seats');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ seats: event.seats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PATCH /api/events/:id/seats/lock
exports.lockSeats = async (req, res) => {
  try {
    const { id } = req.params;
    const { seatNumbers, userId } = req.body;

    if (!seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      return res.status(400).json({ message: 'seatNumbers array is required' });
    }
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const lockExpiry = new Date(Date.now() + 10 * 60 * 1000); // 5 minute hold

    // Release any expired locks first (self-healing)
    await Event.updateOne(
      { _id: id },
      {
        $set: {
          'seats.$[elem].status': 'available',
          'seats.$[elem].lockedBy': null,
          'seats.$[elem].lockExpiry': null,
        },
      },
      {
        arrayFilters: [{ 'elem.status': 'locked', 'elem.lockExpiry': { $lt: new Date() } }],
      }
    );

    // Atomically lock only seats currently available
    await Event.updateOne(
      { _id: id },
      {
        $set: {
          'seats.$[elem].status': 'locked',
          'seats.$[elem].lockedBy': userId,
          'seats.$[elem].lockExpiry': lockExpiry,
        },
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: seatNumbers }, 'elem.status': 'available' }],
      }
    );

    // Verify every requested seat actually got locked by THIS user
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const lockedSeats = event.seats.filter(
      (s) => seatNumbers.includes(s.seatNumber) && s.status === 'locked' && s.lockedBy === userId
    );

    if (lockedSeats.length !== seatNumbers.length) {
      // Someone else grabbed a seat first -> roll back the ones we did lock
      await Event.updateOne(
        { _id: id },
        {
          $set: {
            'seats.$[elem].status': 'available',
            'seats.$[elem].lockedBy': null,
            'seats.$[elem].lockExpiry': null,
          },
        },
        {
          arrayFilters: [{ 'elem.seatNumber': { $in: seatNumbers }, 'elem.lockedBy': userId }],
        }
      );
      return res.status(409).json({ message: 'One or more selected seats are no longer available' });
    }

    res.status(200).json({ message: 'Seats locked successfully', lockExpiry, seats: lockedSeats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PATCH /api/events/:id/seats/confirm
exports.confirmSeats = async (req, res) => {
  try {
    const { id } = req.params;
    const { seatNumbers, userId } = req.body;

    const result = await Event.updateOne(
      { _id: id },
      {
        $set: {
          'seats.$[elem].status': 'booked',
          'seats.$[elem].lockExpiry': null,
        },
        $inc: { availableSeats: -seatNumbers.length },
      },
      {
        arrayFilters: [
          { 'elem.seatNumber': { $in: seatNumbers }, 'elem.lockedBy': userId, 'elem.status': 'locked' },
        ],
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: 'Seats could not be confirmed - lock expired or invalid' });
    }

    res.status(200).json({ message: 'Seats booked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PATCH /api/events/:id/seats/release
exports.releaseSeats = async (req, res) => {
  try {
    const { id } = req.params;
    const { seatNumbers, userId } = req.body;

    await Event.updateOne(
      { _id: id },
      {
        $set: {
          'seats.$[elem].status': 'available',
          'seats.$[elem].lockedBy': null,
          'seats.$[elem].lockExpiry': null,
        },
      },
      {
        arrayFilters: [{ 'elem.seatNumber': { $in: seatNumbers }, 'elem.lockedBy': userId }],
      }
    );

    res.status(200).json({ message: 'Seats released successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  PUT /api/events/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event updated successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route  DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};