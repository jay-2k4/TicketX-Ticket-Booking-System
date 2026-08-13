import axiosClient from './axiosClient';

// Maps to payment-service via the gateway: /api/payments/*
export const payForBooking = (payload) =>
  axiosClient.post('/payments/pay', payload).then((res) => res.data);

export const getPaymentByBooking = (bookingId) =>
  axiosClient.get(`/payments/booking/${bookingId}`).then((res) => res.data);
