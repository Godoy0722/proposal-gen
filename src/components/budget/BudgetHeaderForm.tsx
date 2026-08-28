'use client';

import { BudgetHeader, BudgetClient } from '@/types/budget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, User } from 'lucide-react';
import { maskCNPJ, maskCEP, maskInscricaoEstadual, maskTelefone } from '@/lib/format';

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

interface BudgetHeaderFormProps {
  header: BudgetHeader;
  client: BudgetClient;
  onHeaderChange: (header: BudgetHeader) => void;
  onClientChange: (client: BudgetClient) => void;
}

export function BudgetHeaderForm({ header, client, onHeaderChange, onClientChange }: BudgetHeaderFormProps) {
  const updateHeader = (field: keyof BudgetHeader, value: string) => {
    onHeaderChange({ ...header, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados do Cliente
          </CardTitle>
          <CardDescription>
            Informações do cliente destinatário do orçamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
            <Input
              id="nomeCliente"
              value={client.nomeCliente}
              onChange={(e) => onClientChange({ ...client, nomeCliente: e.target.value })}
              placeholder="Nome completo ou razão social do cliente"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="veiculo">Veículo</Label>
            <Input
              id="veiculo"
              value={client.veiculo}
              onChange={(e) => onClientChange({ ...client, veiculo: e.target.value })}
              placeholder="Modelo, placa ou identificação do veículo"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Cabeçalho da Proposta
          </CardTitle>
          <CardDescription>
            Dados da empresa emissora do orçamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
          <Input
            id="nomeEmpresa"
            value={header.nomeEmpresa}
            onChange={(e) => updateHeader('nomeEmpresa', e.target.value)}
            placeholder="Razão social ou nome fantasia"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input
              id="cnpj"
              value={header.cnpj}
              onChange={(e) => updateHeader('cnpj', maskCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
            <Input
              id="inscricaoEstadual"
              value={header.inscricaoEstadual}
              onChange={(e) => updateHeader('inscricaoEstadual', maskInscricaoEstadual(e.target.value))}
              placeholder="00.000.000-0.0 00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefoneContato">Telefone de Contato *</Label>
            <Input
              id="telefoneContato"
              value={header.telefoneContato}
              onChange={(e) => updateHeader('telefoneContato', maskTelefone(e.target.value))}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefoneContatoSecundario">Telefone Secundário</Label>
            <Input
              id="telefoneContatoSecundario"
              value={header.telefoneContatoSecundario}
              onChange={(e) => updateHeader('telefoneContatoSecundario', maskTelefone(e.target.value))}
              placeholder="(00) 0000-0000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="enderecoCompleto">Endereço Completo *</Label>
          <Input
            id="enderecoCompleto"
            value={header.enderecoCompleto}
            onChange={(e) => updateHeader('enderecoCompleto', e.target.value)}
            placeholder="Rua, número, bairro, complemento"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade *</Label>
            <Input
              id="cidade"
              value={header.cidade}
              onChange={(e) => updateHeader('cidade', e.target.value)}
              placeholder="Cidade"
            />
          </div>
          <div className="space-y-2">
            <Label>Estado *</Label>
            <Select value={header.estado} onValueChange={(value) => updateHeader('estado', value)}>
              <SelectTrigger>
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cep">CEP *</Label>
            <Input
              id="cep"
              value={header.cep}
              onChange={(e) => updateHeader('cep', maskCEP(e.target.value))}
              placeholder="00.000-000"
            />
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
