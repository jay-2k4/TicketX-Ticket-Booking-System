require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/events', eventRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'TicketX Event Service is running' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Event service running on http://localhost:${PORT}`);
});
