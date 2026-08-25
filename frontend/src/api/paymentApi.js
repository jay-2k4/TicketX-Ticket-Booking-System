import axiosClient from './axiosClient';
import { wakePaymentServices } from './wakeservice';

// Maps to payment-service via the gateway: /api/payments/*

export const payForBooking = async (payload) => {
  await wakePaymentServices();

  const res = await axiosClient.post('/payments/pay', payload);

  return res.data;
};

export const getPaymentByBooking = async (bookingId) => {
  await wakePaymentServices();

  const res = await axiosClient.get(
    `/payments/booking/${bookingId}`
  );

  return res.data;
};