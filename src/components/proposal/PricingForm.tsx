'use client';

import dynamic from 'next/dynamic';
import { Pricing, PricingType, ServiceItem, Service } from '@/types/proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

const MDXEditor = dynamic(() => import('@mdxeditor/editor').then(mod => ({ default: mod.MDXEditor })), {
  ssr: false,
  loading: () => <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">Carregando editor...</div>
});

import '@mdxeditor/editor/style.css';
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CreateLink,
  ListsToggle,
  BlockTypeSelect
} from '@mdxeditor/editor';

interface PricingFormProps {
  pricing: Pricing;
  onPricingChange: (pricing: Pricing) => void;
  service: Service;
  onServiceChange: (service: Service) => void;
}

export function PricingForm({ pricing, onPricingChange, service, onServiceChange }: PricingFormProps) {
  const [newService, setNewService] = useState<Partial<ServiceItem>>({
    titulo: '',
    descricao: '',
    valor: 0,
    prazo: 0,
  });

  const services = pricing.services || [];
  const totalValue =
    pricing.type === 'hourly'
      ? pricing.unitValue * pricing.quantity
      : services.reduce((sum, s) => sum + s.valor, 0);

  const addService = () => {
    if (!newService.titulo || newService.valor === undefined || newService.valor <= 0) {
      return;
    }

    const service: ServiceItem = {
      id: Date.now().toString(),
      titulo: newService.titulo,
      descricao: newService.descricao || '',
      valor: newService.valor,
      prazo: newService.prazo || 0,
    };

    onPricingChange({
      ...pricing,
      services: [...services, service],
    });

    setNewService({
      titulo: '',
      descricao: '',
      valor: 0,
      prazo: 0,
    });
  };

  const removeService = (id: string) => {
    onPricingChange({
      ...pricing,
      services: services.filter(s => s.id !== id),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Precificação</CardTitle>
        <CardDescription>
          Defina os valores e tipo de cobrança dos serviços
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Services Clauses */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
          <div>
            <Label htmlFor="servicesClauses" className="text-base font-semibold">
              Cláusulas dos Serviços
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione informações ou cláusulas relacionadas aos serviços que aparecerão antes da tabela de valores
            </p>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <MDXEditor
              markdown={service.servicesClauses || ''}
              onChange={(markdown) => onServiceChange({ ...service, servicesClauses: markdown })}
              plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <BlockTypeSelect />
                      <BoldItalicUnderlineToggles />
                      <CreateLink />
                      <ListsToggle />
                    </>
                  ),
                }),
              ]}
              contentEditableClassName="prose prose-sm max-w-none dark:prose-invert min-h-[200px] p-4 focus:outline-none"
              placeholder="Digite as cláusulas relacionadas aos serviços..."
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Tipo de Cobrança</Label>
          <RadioGroup
            value={pricing.type}
            onValueChange={(value: PricingType) =>
              onPricingChange({ ...pricing, type: value, services: [] })
            }
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly" className="cursor-pointer">
                Por Hora Trabalhada
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="complete" id="complete" />
              <Label htmlFor="complete" className="cursor-pointer">
                Por Serviço Completo
              </Label>
            </div>
          </RadioGroup>
        </div>

        {pricing.type === 'hourly' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitValue">
                Valor Unitário (R$)
              </Label>
              <Input
                id="unitValue"
                type="number"
                step="0.01"
                min="0"
                value={pricing.unitValue || ''}
                onChange={(e) =>
                  onPricingChange({
                    ...pricing,
                    unitValue: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                Quantidade de Horas
              </Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                min="0"
                value={pricing.quantity || ''}
                onChange={(e) =>
                  onPricingChange({
                    ...pricing,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="serviceTitle">Título do Serviço *</Label>
                <Input
                  id="serviceTitle"
                  value={newService.titulo}
                  onChange={(e) =>
                    setNewService({ ...newService, titulo: e.target.value })
                  }
                  placeholder="Ex: Desenvolvimento de Site"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceDescription">Descrição (opcional)</Label>
                <Textarea
                  id="serviceDescription"
                  value={newService.descricao}
                  onChange={(e) =>
                    setNewService({ ...newService, descricao: e.target.value })
                  }
                  placeholder="Descrição detalhada do serviço..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceValue">Valor (R$) *</Label>
                <Input
                  id="serviceValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newService.valor || ''}
                  onChange={(e) =>
                    setNewService({ ...newService, valor: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceDeadline">Prazo Estimado (horas) *</Label>
                <Input
                  id="serviceDeadline"
                  type="number"
                  step="1"
                  min="0"
                  value={newService.prazo || ''}
                  onChange={(e) =>
                    setNewService({ ...newService, prazo: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>

              <Button onClick={addService} className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Serviço
              </Button>
            </div>

            {services.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Serviços Adicionados</Label>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{service.titulo}</p>
                        {service.descricao && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {service.descricao}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-sm font-semibold text-primary">
                            R$ {service.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          {service.prazo > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {service.prazo} hora{service.prazo !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(service.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-4 bg-muted rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm text-muted-foreground">Valor Total:</Label>
            <span className="text-2xl font-bold">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="showTotalValue" className="text-sm font-medium">
                Mostrar valor total no contrato
              </Label>
              <p className="text-xs text-muted-foreground">
                Desmarque para exibir apenas valores individuais/por hora
              </p>
            </div>
            <Switch
              id="showTotalValue"
              checked={pricing.showTotalValue !== false}
              onCheckedChange={(checked) =>
                onPricingChange({ ...pricing, showTotalValue: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
