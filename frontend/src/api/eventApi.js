import axiosClient from './axiosClient';

// Maps to event-service via the gateway: /api/events/*
export const getEvents = (category) =>
  axiosClient
    .get('/events', { params: category ? { category } : {} })
    .then((res) => res.data);

export const getEventById = (id) =>
  axiosClient.get(`/events/${id}`).then((res) => res.data);

export const getEventSeats = (id) =>
  axiosClient.get(`/events/${id}/seats`).then((res) => res.data);
