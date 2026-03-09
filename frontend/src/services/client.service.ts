import { api } from './api';
import { Client, CreateClientRequest } from '@/types';

export const clientService = {
  getAll: () => api.get<Client[]>('/clients'),

  getById: (id: number) => api.get<Client>(`/clients/${id}`),

  create: (data: CreateClientRequest) => api.post<Client>('/clients', data),

  update: (id: number, data: Partial<CreateClientRequest>) =>
    api.put<Client>(`/clients/${id}`, data),

  remove: (id: number) => api.delete(`/clients/${id}`),
};
