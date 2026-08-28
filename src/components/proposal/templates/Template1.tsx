'use client';

import { TemplateProps } from '@/types/proposal';
import { SignatureArea } from '../SignatureArea';
import { Database, Zap, Shield, FileLock, Copyright, ListTodo, Clock, Package, X, Scale, Plus, FileText, CreditCard, FileCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export function Template1({ people, service, pricing, logo, finalized, finalizedDate, signatureDate }: TemplateProps) {
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
    <div className="bg-white dark:bg-slate-900 min-h-screen p-8 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header with Logo */}
        <div className="flex justify-between items-start">
          {logo.preview && (
            <img
              src={logo.preview}
              alt="Logo"
              className="h-20 object-contain"
            />
          )}
          <div className="text-right">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {service.contractTitle || 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {service.contractSubtitle || 'Desenvolvimento e Manutenção de Software'}
            </p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />

        {/* Parties Section */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            Partes Envolvidas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contratantes */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-500 font-semibold">
                Contratante(s)
              </h3>
              {contractors.length > 0 ? (
                <div className="space-y-3">
                  {contractors.map((person) => (
                    <div key={person.id} className="border-l-2 border-slate-300 dark:border-slate-600 pl-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {person.nomeCompleto}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {person.cpfCnpj}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {person.email}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Não informado</p>
              )}
            </div>

            {/* Contratadas */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-500 font-semibold">
                Contratada(s)
              </h3>
              {contractorsList.length > 0 ? (
                <div className="space-y-3">
                  {contractorsList.map((person) => (
                    <div key={person.id} className="border-l-2 border-blue-400 pl-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {person.nomeCompleto}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {person.cpfCnpj}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {person.email}
                      </p>
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
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
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
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              Cláusulas dos Serviços
            </h2>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                  {service.servicesClauses}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* Pricing - Moved to end before signatures */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            Investimento
          </h2>
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold">
                    Entregável / Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold">
                    Detalhes
                  </th>
                  <th className="px-6 py-3 text-center text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold">
                    Prazo (horas)
                  </th>
                  <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold">
                    Valor (R$)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {pricing.type === 'hourly' ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">
                      Desenvolvimento por Horas
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {pricing.quantity} hora(s) × R$ {pricing.unitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-slate-900 dark:text-white font-semibold">
                      {pricing.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-slate-900 dark:text-white">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {service.titulo}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {service.descricao || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-semibold text-slate-900 dark:text-white">
                        {service.prazo || 0}
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-slate-900 dark:text-white">
                        R$ {service.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {showTotalValue && (
                <tfoot className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                      Total do Projeto
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-lg text-slate-900 dark:text-white">
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