require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const paymentRoutes = require('./routes/paymentRoutes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'payment-service' }));
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => console.log(`💳 Payment Service running on port ${PORT}`));