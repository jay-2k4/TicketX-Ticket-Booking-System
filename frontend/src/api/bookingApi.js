import axiosClient from './axiosClient';

// Maps to booking-service via the gateway: /api/bookings/*
export const createBooking = (payload) =>
  axiosClient.post('/bookings', payload).then((res) => res.data);

export const confirmBooking = (id, payload) =>
  axiosClient.patch(`/bookings/${id}/confirm`, payload).then((res) => res.data);

export const cancelBooking = (id) =>
  axiosClient.patch(`/bookings/${id}/cancel`).then((res) => res.data);

export const getMyBookings = (userId) =>
  axiosClient.get(`/bookings/user/${userId}`).then((res) => res.data);

export const getBookingById = (id) =>
  axiosClient.get(`/bookings/${id}`).then((res) => res.data);
