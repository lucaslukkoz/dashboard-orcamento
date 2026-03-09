'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/Card';
import Button from '@/components/Button';
import StatusBadge from '@/components/StatusBadge';
import { quotationService } from '@/services/quotation.service';
import { Quotation } from '@/types';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await quotationService.getAll();
        setQuotations(data);
      } catch (err) {
        console.error('Failed to load quotations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleExportPdf = async (id: number) => {
    try {
      await quotationService.exportPdf(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao exportar PDF');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
    try {
      await quotationService.remove(id);
      setQuotations((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao excluir orçamento');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-500 mt-1">Crie e gerencie seus orçamentos</p>
        </div>
        <Link href="/quotations/new" className="self-start sm:self-auto">
          <Button>Novo Orçamento</Button>
        </Link>
      </div>

      {/* Quotation List */}
      {quotations.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <svg className="mx-auto w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mt-4">Nenhum orçamento ainda</p>
            <Link href="/quotations/new">
              <Button className="mt-4" size="sm">Crie seu primeiro orçamento</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="px-4 lg:px-6 py-4 font-medium">ID</th>
                  <th className="px-4 lg:px-6 py-4 font-medium">Cliente</th>
                  <th className="px-4 lg:px-6 py-4 font-medium">Total</th>
                  <th className="px-4 lg:px-6 py-4 font-medium">Status</th>
                  <th className="px-4 lg:px-6 py-4 font-medium hidden sm:table-cell">Data</th>
                  <th className="px-4 lg:px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="text-gray-600 hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 font-medium text-gray-900">#{q.id}</td>
                    <td className="px-4 lg:px-6 py-4">{q.client?.name || '-'}</td>
                    <td className="px-4 lg:px-6 py-4">R${Number(q.totalPrice).toFixed(2)}</td>
                    <td className="px-4 lg:px-6 py-4"><StatusBadge status={q.status} /></td>
                    <td className="px-4 lg:px-6 py-4 hidden sm:table-cell">{new Date(q.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleExportPdf(q.id)}>
                          PDF
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(q.id)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
