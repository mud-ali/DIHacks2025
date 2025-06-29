import axios from 'axios';
import { isTokenExpired, isValidTokenFormat } from '@/utils/auth';

// Create axios instance
const api = axios.create();

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && isValidTokenFormat(token) && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token) {
      // Token is invalid or expired, remove it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
