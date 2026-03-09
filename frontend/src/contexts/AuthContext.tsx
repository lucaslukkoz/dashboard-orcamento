'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Company, LoginRequest, RegisterRequest } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthContextType {
  company: Company | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = authService.getCompany();
    if (saved) setCompany(saved);
    setIsLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data);
    authService.saveAuth(response);
    setCompany(response.company);
    router.push('/dashboard');
  };

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data);
    authService.saveAuth(response);
    setCompany(response.company);
    router.push('/dashboard');
  };

  const logout = () => {
    authService.logout();
    setCompany(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ company, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
