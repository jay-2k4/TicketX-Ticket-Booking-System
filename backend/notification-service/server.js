require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notificationRoutes');

mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Notification DB connected'));

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`📧 Notification Service running on port ${PORT}`));