require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'TicketX User Service is running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`User service running on http://localhost:${PORT}`);
});
