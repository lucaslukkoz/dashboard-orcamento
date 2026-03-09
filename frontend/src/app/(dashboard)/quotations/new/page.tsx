'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { clientService } from '@/services/client.service';
import { quotationService } from '@/services/quotation.service';
import { Client } from '@/types';

interface ItemForm {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [items, setItems] = useState<ItemForm[]>([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    clientService.getAll().then(setClients).catch(console.error);
  }, []);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemForm, value: string | number) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientId) {
      setError('Por favor, selecione um cliente');
      return;
    }

    if (items.some((item) => !item.description || item.unitPrice <= 0)) {
      setError('Todos os itens devem ter uma descrição e preço maior que 0');
      return;
    }

    setIsLoading(true);

    try {
      await quotationService.create({
        clientId: Number(clientId),
        notes: notes || undefined,
        validUntil: validUntil || undefined,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      });
      router.push('/quotations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao criar orçamento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Novo Orçamento</h1>
        <p className="text-gray-500 mt-1">Crie um novo orçamento para um cliente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Client & Details */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Cliente</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Válido até (opcional)"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
              <div className="hidden sm:block" /> {/* spacer */}
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Observações (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Observações adicionais para o orçamento..."
              />
            </div>
          </div>
        </Card>

        {/* Items */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Itens</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              + Adicionar Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 sm:items-end p-3 sm:p-0 rounded-lg bg-gray-50 sm:bg-transparent">
                <div className="flex-1">
                  <Input
                    label={index === 0 || true ? 'Descrição' : ''}
                    placeholder="Descrição do item"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3 sm:contents">
                  <div className="flex-1 sm:w-24 sm:flex-none">
                    <Input
                      label={index === 0 || true ? 'Qtd' : ''}
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div className="flex-1 sm:w-32 sm:flex-none">
                    <Input
                      label={index === 0 || true ? 'Preço Unit.' : ''}
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between sm:contents">
                  <div className="sm:w-28 text-right">
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:hidden">Total</label>
                    {index === 0 && <label className="hidden sm:block text-sm font-medium text-gray-700 mb-1">Total</label>}
                    <p className="py-2 text-gray-600 font-medium">
                      R${(item.quantity * item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                  <div className="pb-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Geral</p>
              <p className="text-2xl font-bold text-purple-600">R${totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.push('/quotations')}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading} size="lg">
            Criar Orçamento
          </Button>
        </div>
      </form>
    </div>
  );
}
