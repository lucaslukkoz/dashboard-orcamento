// ---- Auth ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface AuthResponse {
  company: Company;
  token: string;
}

// ---- Company ----
export interface Company {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

// ---- Client ----
export interface Client {
  id: number;
  companyId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

// ---- Quotation ----
export interface QuotationItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: number;
  companyId: number;
  clientId: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  totalPrice: number;
  notes?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  items?: QuotationItem[];
}

export interface CreateQuotationRequest {
  clientId: number;
  notes?: string;
  validUntil?: string;
  items: Omit<QuotationItem, 'id' | 'totalPrice'>[];
}
