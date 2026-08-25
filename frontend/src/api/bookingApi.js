import axiosClient from './axiosClient';
import { wakeBookingServices } from './wakeservice';

// Maps to booking-service via the gateway: /api/bookings/*

export const createBooking = async (payload) => {
  await wakeBookingServices();

  const res = await axiosClient.post('/bookings', payload);

  return res.data;
};

export const confirmBooking = async (id, payload) => {
  await wakeBookingServices();

  const res = await axiosClient.patch(
    `/bookings/${id}/confirm`,
    payload
  );

  return res.data;
};

export const cancelBooking = async (id) => {
  await wakeBookingServices();

  const res = await axiosClient.patch(
    `/bookings/${id}/cancel`
  );

  return res.data;
};

export const getMyBookings = async (userId) => {
  await wakeBookingServices();

  const res = await axiosClient.get(
    `/bookings/user/${userId}`
  );

  return res.data;
};

export const getBookingById = async (id) => {
  await wakeBookingServices();

  const res = await axiosClient.get(
    `/bookings/${id}`
  );

  return res.data;
};