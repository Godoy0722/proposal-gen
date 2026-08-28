import type { Logo } from '@/types/proposal';

export interface BudgetClient {
  nomeCliente: string;
  veiculo: string;
}

export interface BudgetHeader {
  nomeEmpresa: string;
  cnpj: string;
  inscricaoEstadual: string;
  enderecoCompleto: string;
  cidade: string;
  estado: string;
  cep: string;
  telefoneContato: string;
  telefoneContatoSecundario: string;
}

export interface BudgetItem {
  id: string;
  descricao: string;
  valorUnitario: number;
  quantidade: number;
}

export interface BudgetData {
  header: BudgetHeader;
  client: BudgetClient;
  items: BudgetItem[];
  desconto: number;
  selectedTemplate: number;
  logo: Logo;
  finalized: boolean;
  finalizedDate?: string;
}

export interface BudgetTemplateProps {
  header: BudgetHeader;
  client: BudgetClient;
  items: BudgetItem[];
  desconto: number;
  logo: Logo;
  finalized?: boolean;
  finalizedDate?: string;
}
