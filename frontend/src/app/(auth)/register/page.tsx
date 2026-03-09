'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/Input';
import Button from '@/components/Button';

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600">L9 Orçamento</h1>
          <p className="text-gray-500 mt-2">Crie a conta da sua empresa</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <Input
              label="Nome da Empresa"
              placeholder="Nome da sua empresa"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="empresa@exemplo.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Senha"
                type="password"
                placeholder="Mín. 6 caracteres"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                required
                minLength={6}
              />
              <Input
                label="Confirmar Senha"
                type="password"
                placeholder="Repita a senha"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                required
              />
            </div>

            <Input
              label="Telefone (opcional)"
              type="tel"
              placeholder="+55 11 99999-9999"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />

            <Input
              label="Endereço (opcional)"
              placeholder="Endereço da empresa"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
            />

            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Criar Conta
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
