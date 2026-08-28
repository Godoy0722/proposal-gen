'use client';

import { useState } from 'react';
import { BudgetItem } from '@/types/budget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Package } from 'lucide-react';
import { formatBRL, parseCurrencyInput } from '@/lib/format';
import { getDiscountAmount, getFinalTotal, getItemTotal, getSubtotal } from '@/lib/budgetCalculations';

interface BudgetItemsFormProps {
  items: BudgetItem[];
  desconto: number;
  onItemsChange: (items: BudgetItem[]) => void;
  onDescontoChange: (desconto: number) => void;
}

export function BudgetItemsForm({ items, desconto, onItemsChange, onDescontoChange }: BudgetItemsFormProps) {
  const [newItem, setNewItem] = useState({
    descricao: '',
    valorUnitario: '',
    quantidade: '1',
  });

  const subtotal = getSubtotal(items);
  const discountAmount = getDiscountAmount(subtotal, desconto);
  const finalTotal = getFinalTotal(items, desconto);

  const addItem = () => {
    const valorUnitario = parseCurrencyInput(newItem.valorUnitario);
    const quantidade = parseInt(newItem.quantidade, 10) || 0;

    if (!newItem.descricao.trim() || valorUnitario <= 0 || quantidade <= 0) return;

    onItemsChange([
      ...items,
      {
        id: Date.now().toString(),
        descricao: newItem.descricao.trim(),
        valorUnitario,
        quantidade,
      },
    ]);

    setNewItem({ descricao: '', valorUnitario: '', quantidade: '1' });
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const handleDescontoChange = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''), 10);
    if (!value) {
      onDescontoChange(0);
      return;
    }
    if (Number.isFinite(num) && num >= 1 && num <= 100) {
      onDescontoChange(num);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Produtos
        </CardTitle>
        <CardDescription>
          Adicione os produtos e valores do orçamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              value={newItem.descricao}
              onChange={(e) => setNewItem({ ...newItem, descricao: e.target.value })}
              placeholder="Descrição do produto ou serviço"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorUnitario">Valor Unitário (R$) *</Label>
              <Input
                id="valorUnitario"
                value={newItem.valorUnitario}
                onChange={(e) => setNewItem({ ...newItem, valorUnitario: e.target.value })}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={newItem.quantidade}
                onChange={(e) => setNewItem({ ...newItem, quantidade: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={addItem} className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>

        {items.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Produtos Adicionados</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.descricao}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.quantidade} × R$ {formatBRL(item.valorUnitario)} = R$ {formatBRL(getItemTotal(item))}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
          <div className="space-y-2">
            <Label htmlFor="desconto">Desconto (%)</Label>
            <Input
              id="desconto"
              type="number"
              min="1"
              max="100"
              value={desconto || ''}
              onChange={(e) => handleDescontoChange(e.target.value)}
              placeholder="1 a 100"
            />
            <p className="text-xs text-muted-foreground">
              Percentual de desconto sobre o valor total (opcional)
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {formatBRL(subtotal)}</span>
            </div>
            {desconto > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto ({desconto}%)</span>
                <span className="text-destructive">- R$ {formatBRL(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Valor Final</span>
              <span>R$ {formatBRL(finalTotal)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
