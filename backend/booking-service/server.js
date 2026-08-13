require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const bookingRoutes = require('./routes/bookingRoutes');
const { startExpirySweeper } = require('./utils/expirySweeper'); // ← added

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'TicketX Booking Service is running' });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Booking service running on http://localhost:${PORT}`);
  startExpirySweeper(); // ← added
});