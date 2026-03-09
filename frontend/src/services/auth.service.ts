import { api } from './api';
import { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authService = {
  login: (data: LoginRequest) => api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) => api.post<AuthResponse>('/auth/register', data),

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('company');
  },

  saveAuth: (auth: AuthResponse) => {
    localStorage.setItem('token', auth.token);
    localStorage.setItem('company', JSON.stringify(auth.company));
  },

  getCompany: () => {
    const data = typeof window !== 'undefined' ? localStorage.getItem('company') : null;
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      localStorage.removeItem('company');
      return null;
    }
  },

  isAuthenticated: () => {
    return typeof window !== 'undefined' && !!localStorage.getItem('token');
  },
};
