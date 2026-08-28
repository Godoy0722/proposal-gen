'use client';

import { TemplateProps } from '@/types/proposal';
import { SignatureArea } from '../SignatureArea';
import { Code, Database, Layers, Zap, Shield, FileLock, Copyright, ListTodo, Clock, Package, X, Scale, Plus, FileText, CreditCard, FileCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export function Template3({ people, service, pricing, logo, finalized, finalizedDate, signatureDate }: TemplateProps) {
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
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-8 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-800 text-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-start">
            {logo.preview ? (
              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow-lg">
                <img
                  src={logo.preview}
                  alt="Logo"
                  className="h-16 object-contain"
                />
              </div>
            ) : (
              <div className="h-20" />
            )}
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                {service.contractTitle || 'Proposta de Desenvolvimento de Software'}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-px w-16 bg-slate-600" />
                <span className="text-sm text-slate-400 uppercase tracking-widest">
                  {service.contractSubtitle || 'Solução Tecnológica Profissional'}
                </span>
                <div className="h-px w-16 bg-slate-600" />
              </div>
            </div>
            <div className="w-20" />
          </div>
        </div>

        {/* Parties Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <div className="h-5 w-5 bg-slate-600 dark:bg-slate-400 rounded" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Identificação das Partes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contratantes */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm uppercase tracking-wider">
                Contratante(s)
              </h3>
              {contractors.length > 0 ? (
                <div className="space-y-3">
                  {contractors.map((person) => (
                    <div key={person.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {person.nomeCompleto}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          CPF/CNPJ: <span className="font-mono">{person.cpfCnpj}</span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          E-mail: {person.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Não informado</p>
              )}
            </div>

            {/* Contratadas */}
            <div className="bg-blue-50 dark:bg-blue-950 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 text-sm uppercase tracking-wider">
                Contratada(s)
              </h3>
              {contractorsList.length > 0 ? (
                <div className="space-y-3">
                  {contractorsList.map((person) => (
                    <div key={person.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {person.nomeCompleto}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          CPF/CNPJ: <span className="font-mono">{person.cpfCnpj}</span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          E-mail: {person.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Não informado</p>
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
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <FileCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Cláusulas dos Serviços
              </h2>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {service.servicesClauses}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Pricing - Moved to end before signatures */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <div className="h-5 w-5 bg-blue-600 dark:bg-blue-400 rounded" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Detalhamento de Custos
            </h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-300 dark:border-slate-600">
            <table className="w-full">
              <thead className="bg-slate-800 dark:bg-slate-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">
                    Módulo / Funcionalidade
                  </th>
                  <th className="px-6 py-4 text-left font-bold">
                    Especificação
                  </th>
                  <th className="px-6 py-4 text-center font-bold">
                    Prazo (horas)
                  </th>
                  <th className="px-6 py-4 text-right font-bold">
                    Valor (R$)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {pricing.type === 'hourly' ? (
                  <tr className="bg-slate-50 dark:bg-slate-900">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      Desenvolvimento Horista
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {pricing.quantity} hora(s) × R$ {pricing.unitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900 dark:text-white">
                      {pricing.quantity}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ) : (
                  services.map((serviceItem) => (
                    <tr key={serviceItem.id} className="bg-slate-50 dark:bg-slate-900">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {serviceItem.titulo}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {serviceItem.descricao || 'Conforme documentação técnica'}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-900 dark:text-white">
                        {serviceItem.prazo || 0}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                        R$ {serviceItem.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {showTotalValue && (
                <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-slate-800 dark:text-slate-200">
                      Total do Investimento
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900 dark:text-slate-100 text-xl">
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