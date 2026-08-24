require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'TicketX API Gateway is running' });
});

app.use('/api/auth', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/auth/' },
}));

app.use('/api/events', createProxyMiddleware({
  target: process.env.EVENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/events/' },
}));

app.use('/api/bookings', createProxyMiddleware({
  target: process.env.BOOKING_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/bookings/' },
}));

app.use('/api/payments', createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/payments/' },
}));

app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/': '/api/notifications/' },
}));

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
});