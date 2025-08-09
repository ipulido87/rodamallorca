import axios from 'axios';
import { API_URL } from '../constants/api';

const API = axios.create({ baseURL: API_URL });

export const register = async (email: string, password: string) => {
  const res = await API.post('/auth/register', { email, password });
  return res.data;
};

export const login = async (email: string, password: string) => {
  const res = await API.post('/auth/login', { email, password });
  return res.data;
};

export const verifyCode = async (email: string, code: string) => {
  const res = await API.post('/auth/verify', { email, code });
  return res.data;
};