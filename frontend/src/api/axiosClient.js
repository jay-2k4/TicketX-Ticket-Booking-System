import axios from 'axios';

// All requests go through the API Gateway (see backend/api-gateway/server.js),
// which proxies to the individual microservices.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the JWT (set by the user-service on login/register) to every request.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ticketx_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralize the "session expired" case so every page doesn't have to handle it.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ticketx_token');
      localStorage.removeItem('ticketx_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
