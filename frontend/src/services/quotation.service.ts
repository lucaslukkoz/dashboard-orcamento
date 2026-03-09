import { api } from './api';
import { Quotation, CreateQuotationRequest } from '@/types';

export const quotationService = {
  getAll: () => api.get<Quotation[]>('/quotations'),

  getById: (id: number) => api.get<Quotation>(`/quotations/${id}`),

  create: (data: CreateQuotationRequest) => api.post<Quotation>('/quotations', data),

  update: (id: number, data: Partial<CreateQuotationRequest & { status: string }>) =>
    api.put<Quotation>(`/quotations/${id}`, data),

  remove: (id: number) => api.delete(`/quotations/${id}`),

  exportPdf: async (id: number) => {
    const blob = await api.get<Blob>(`/quotations/${id}/pdf`);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quotation-${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  send: (id: number) =>
    api.post<{ message: string }>(`/quotations/${id}/send`, {}),
};
