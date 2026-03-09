'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import StatusBadge from '@/components/StatusBadge';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { clientService } from '@/services/client.service';
import { quotationService } from '@/services/quotation.service';
import { Client, Quotation } from '@/types';

export default function DashboardPage() {
  const { company, logout } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, q] = await Promise.all([
          clientService.getAll(),
          quotationService.getAll(),
        ]);
        setClients(c);
        setQuotations(q);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { label: 'Total de Clientes', value: clients.length, color: 'text-purple-600' },
    { label: 'Total de Orçamentos', value: quotations.length, color: 'text-blue-600' },
    {
      label: 'Aceitos',
      value: quotations.filter((q) => q.status === 'accepted').length,
      color: 'text-green-600',
    },
    {
      label: 'Pendentes',
      value: quotations.filter((q) => q.status === 'draft' || q.status === 'sent').length,
      color: 'text-amber-600',
    },
  ];

  const recentQuotations = quotations.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-lg font-bold text-white shadow-md shrink-0">
            {company?.name?.charAt(0).toUpperCase() || "C"}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Bem-vindo, {company?.name}
            </h1>
            <p className="text-gray-500 mt-0.5 truncate">{company?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500
            hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/clients">
          <Button variant="secondary" className="w-full sm:w-auto">Gerenciar Clientes</Button>
        </Link>
        <Link href="/quotations/new">
          <Button className="w-full sm:w-auto">Novo Orçamento</Button>
        </Link>
      </div>

      {/* Recent Quotations */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Orçamentos Recentes</h2>
        {recentQuotations.length === 0 ? (
          <p className="text-gray-500 text-sm">Nenhum orçamento ainda. Crie o primeiro!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentQuotations.map((q) => (
                  <tr key={q.id} className="text-gray-600">
                    <td className="py-3">#{q.id}</td>
                    <td className="py-3">{q.client?.name || '-'}</td>
                    <td className="py-3">R${Number(q.totalPrice).toFixed(2)}</td>
                    <td className="py-3"><StatusBadge status={q.status} /></td>
                    <td className="py-3">{new Date(q.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
