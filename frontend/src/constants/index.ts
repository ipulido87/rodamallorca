export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROTECTED: '/auth/protected',
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'access_token',
};
