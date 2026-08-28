'use client';

import { TemplateProps } from '@/types/proposal';
import { SignatureArea } from '../SignatureArea';
import { FileText, Server, Shield, FileLock, Copyright, ListTodo, Clock, Package, X, Scale, Plus, CreditCard, FileCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export function Template2({ people, service, pricing, logo, finalized, finalizedDate, signatureDate }: TemplateProps) {
  const contractors = people.filter(p => p.type === 'CONTRATANTE');
  const contractorsList = people.filter(p => p.type === 'CONTRATADA');
  const services = pricing.services || [];
  const totalValue =
    pricing.type === 'hourly'
      ? pricing.unitValue * pricing.quantity
      : services.reduce((sum, s) => sum + s.valor, 0);
  const totalHours =
    pricing.type === 'hourly'
      ? pricing.quantity
      : services.reduce((sum, s) => sum + (s.prazo || 0), 0);
  
  const showTotalValue = pricing.showTotalValue !== false;
  
  // Section configuration
  const sectionConfig: Record<string, { icon: any; label: string }> = {
    contractObject: { icon: FileText, label: 'Objeto do Contrato' },
    payment: { icon: CreditCard, label: 'Pagamento' },
    confidentiality: { icon: FileLock, label: 'Confidencialidade' },
    privacy: { icon: Shield, label: 'Privacidade e Proteção de Dados' },
    intellectualProperty: { icon: Copyright, label: 'Propriedade Intelectual' },
    obligations: { icon: ListTodo, label: 'Obrigações das Partes' },
    termValidity: { icon: Clock, label: 'Prazo e Vigência' },
    delivery: { icon: Package, label: 'Recebimento e Entrega' },
    termination: { icon: X, label: 'Rescisão' },
    disputeResolution: { icon: Scale, label: 'Resolução de Disputas' },
    additionalContent: { icon: Plus, label: 'Conteúdo Adicional' },
  };

  // Get sections in order
  const defaultOrder = ['contractObject', 'payment', 'confidentiality', 'privacy', 'intellectualProperty', 'obligations', 'termValidity', 'delivery', 'termination', 'disputeResolution', 'additionalContent'];
  const sectionsOrder = service.sectionsOrder || defaultOrder;
  const orderedSections = sectionsOrder
    .map(key => ({ key, content: (service as any)[key], config: sectionConfig[key] }))
    .filter(s => s.content && s.content.trim() !== '' && s.config);

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen p-8 md:p-12 font-serif">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b-4 border-slate-800 dark:border-slate-200 pb-6">
          <div className="flex justify-between items-start">
            {logo.preview && (
              <img
                src={logo.preview}
                alt="Logo"
                className="h-24 object-contain"
              />
            )}
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {service.contractTitle || 'PROPOSTA COMERCIAL'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 uppercase tracking-widest">
                {service.contractSubtitle || 'Desenvolvimento de Sistemas e Soluções de Software'}
              </p>
            </div>
            <div className="w-24" />
          </div>
        </div>

        {/* Parties Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b-2 border-slate-300 dark:border-slate-700 pb-2 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            DAS PARTES CONTRATANTES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">
                CONTRATANTE(S)
              </h3>
              {contractors.length > 0 ? (
                <div className="space-y-3">
                  {contractors.map((person, index) => (
                    <div key={person.id}>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {index + 1}ª CONTRATANTE: {person.nomeCompleto}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 pl-4 mt-1">
                        CPF/CNPJ: {person.cpfCnpj}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 pl-4">
                        E-mail: {person.email}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Não informado</p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">
                CONTRATADA(S)
              </h3>
              {contractorsList.length > 0 ? (
                <div className="space-y-3">
                  {contractorsList.map((person, index) => (
                    <div key={person.id}>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {index + 1}ª CONTRATADA: {person.nomeCompleto}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 pl-4 mt-1">
                        CPF/CNPJ: {person.cpfCnpj}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 pl-4">
                        E-mail: {person.email}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Não informado</p>
              )}
            </div>
          </div>
        </div>

        {/* Optional Sections - Rendered in custom order */}
        {orderedSections.map((section) => {
          const Icon = section.config.icon;
          return (
            <div key={section.key} className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                {section.config.label}
              </h2>
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700">
                <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {section.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {/* Services Clauses - Before Pricing */}
        {service.servicesClauses && service.servicesClauses.trim() !== '' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b-2 border-slate-300 dark:border-slate-700 pb-2 flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              CLÁUSULAS DOS SERVIÇOS
            </h2>
            <div className="border-2 border-slate-300 dark:border-slate-700 p-6 rounded bg-slate-50 dark:bg-slate-800/50">
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {service.servicesClauses}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Pricing - Moved to end before signatures */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b-2 border-slate-300 dark:border-slate-700 pb-2 flex items-center gap-2">
            <Server className="h-5 w-5" />
            DOS VALORES E PRAZOS
          </h2>
          <div className="border-2 border-slate-800 dark:border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">
                    Item / Módulo
                  </th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider">
                    Especificações
                  </th>
                  <th className="px-4 py-3 text-center font-bold uppercase tracking-wider">
                    Prazo (horas)
                  </th>
                  <th className="px-4 py-3 text-right font-bold uppercase tracking-wider">
                    Valor (R$)
                  </th>
                </tr>
              </thead>
              <tbody>
                {pricing.type === 'hourly' ? (
                  <tr className="border-b border-slate-300 dark:border-slate-700">
                    <td className="px-4 py-3">
                      Serviços de Desenvolvimento (Horista)
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {pricing.quantity} hora(s) de desenvolvimento<br />
                      R$ {pricing.unitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/hora
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      {pricing.quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="border-b border-slate-300 dark:border-slate-700">
                      <td className="px-4 py-3 font-semibold">
                        {service.titulo}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {service.descricao || 'Conforme especificações técnicas'}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">
                        {service.prazo || 0}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        R$ {service.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {showTotalValue && (
                <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-slate-800 dark:text-slate-200">
                      VALOR TOTAL DA PROPOSTA:
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900 dark:text-slate-100 text-lg">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

        </div>

        {/* Signature Area */}
        <SignatureArea
          signatureDate={signatureDate}
        />
      </div>
    </div>
  );
}