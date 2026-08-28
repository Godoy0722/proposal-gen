export type PersonType = 'CONTRATANTE' | 'CONTRATADA';

export interface Person {
  id: string;
  type: PersonType;
  nomeCompleto: string;
  cpfCnpj: string;
  email: string;
}

export type PricingType = 'hourly' | 'complete';

export interface ServiceItem {
  id: string;
  titulo: string;
  descricao: string;
  valor: number;
  prazo: number;
}

export interface Pricing {
  type: PricingType;
  unitValue: number;
  quantity: number;
  services?: ServiceItem[];
  showTotalValue?: boolean;
}

export interface Service {
  contractTitle?: string;
  contractSubtitle?: string;
  description: string;
  servicesClauses?: string;
  contractObject?: string;
  payment?: string;
  confidentiality?: string;
  privacy?: string;
  intellectualProperty?: string;
  obligations?: string;
  termValidity?: string;
  delivery?: string;
  termination?: string;
  disputeResolution?: string;
  additionalContent?: string;
  sectionsOrder?: string[];
}

export interface Logo {
  file: File | null;
  preview: string;
}

export interface ProposalData {
  people: Person[];
  service: Service;
  pricing: Pricing;
  logo: Logo;
  selectedTemplate: number;
  finalized: boolean;
  finalizedDate?: string;
  signatureDate?: string;
}

export interface TemplateProps {
  people: Person[];
  service: Service;
  pricing: Pricing;
  logo: Logo;
  finalized?: boolean;
  finalizedDate?: string;
  signatureDate?: string;
}

export interface SignatureAreaProps {
  signatureDate?: string;
}
