'use client';

import { useEffect, useState, FormEvent } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal from '@/components/Modal';
import { clientService } from '@/services/client.service';
import { Client } from '@/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });

  const loadClients = async () => {
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await clientService.create({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      setForm({ name: '', email: '', phone: '', address: '' });
      setIsModalOpen(false);
      await loadClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar cliente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
      await clientService.remove(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao excluir cliente');
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
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie sua base de clientes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="self-start sm:self-auto">Adicionar Cliente</Button>
      </div>

      {/* Client List */}
      {clients.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <svg className="mx-auto w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 mt-4">Nenhum cliente ainda</p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-4" size="sm">
              Adicione seu primeiro cliente
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-200">
                  <th className="px-4 lg:px-6 py-4 font-medium">Nome</th>
                  <th className="px-4 lg:px-6 py-4 font-medium">E-mail</th>
                  <th className="px-4 lg:px-6 py-4 font-medium">Telefone</th>
                  <th className="px-4 lg:px-6 py-4 font-medium hidden sm:table-cell">Criado em</th>
                  <th className="px-4 lg:px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => (
                  <tr key={client.id} className="text-gray-600 hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 font-medium text-gray-900">{client.name}</td>
                    <td className="px-4 lg:px-6 py-4">{client.email || '-'}</td>
                    <td className="px-4 lg:px-6 py-4">{client.phone || '-'}</td>
                    <td className="px-4 lg:px-6 py-4 hidden sm:table-cell">{new Date(client.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 lg:px-6 py-4 text-right">
                      <Button variant="danger" size="sm" onClick={() => handleDelete(client.id)}>
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Client Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Cliente">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
          <Input
            label="Nome"
            placeholder="Nome do cliente"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
          <Input
            label="E-mail (opcional)"
            type="email"
            placeholder="cliente@exemplo.com"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          <Input
            label="Telefone (opcional)"
            type="tel"
            placeholder="+55 11 99999-9999"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
          <Input
            label="Endereço (opcional)"
            placeholder="Endereço do cliente"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Criar Cliente
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
