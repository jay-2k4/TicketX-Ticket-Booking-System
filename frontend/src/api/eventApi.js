import axiosClient from './axiosClient';
import { wakeEventServices } from './wakeservice';

export const getEvents = async (category) => {
  await wakeEventServices();

  const res = await axiosClient.get('/events', {
    params: category ? { category } : {},
  });

  return res.data;
};

export const getEventById = async (id) => {
  await wakeEventServices();

  const res = await axiosClient.get(`/events/${id}`);

  return res.data;
};

export const getEventSeats = async (id) => {
  await wakeEventServices();

  const res = await axiosClient.get(`/events/${id}/seats`);

  return res.data;
};