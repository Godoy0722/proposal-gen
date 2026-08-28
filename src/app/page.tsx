'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { PersonForm } from '@/components/proposal/PersonForm';
import { PricingForm } from '@/components/proposal/PricingForm';
import { LogoUpload } from '@/components/proposal/LogoUpload';
import { TemplateSelector } from '@/components/proposal/TemplateSelector';
import { ProposalPreview } from '@/components/proposal/ProposalPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ModuleNav } from '@/components/ModuleNav';
import { FileDown, FileText, Users, DollarSign, Image as ImageIcon, Layout, Calendar, Upload, Download } from 'lucide-react';
import { ProposalData, Person, Service, Pricing, Logo } from '@/types/proposal';
import { useToast } from '@/hooks/use-toast';
import { downloadProposalPdfTemplate } from '@/lib/proposalPdfTemplate';
import { exportProposalToJson, importProposalFromJson } from '@/lib/json-io';
import './proposal-print.css';

const ServiceSectionsEditor = dynamic(() => import('@/components/proposal/ServiceSectionsEditor').then(mod => ({ default: mod.ServiceSectionsEditor })), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-muted-foreground">Carregando editor...</div>
});

export default function ProposalPage() {
  const { toast } = useToast();
  const importFileRef = useRef<HTMLInputElement>(null);
  const [formKey, setFormKey] = useState(0);
  const [activeTab, setActiveTab] = useState("template");
  const [proposalData, setProposalData] = useState<ProposalData>({
    people: [],
    service: {
      description: '',
    },
    pricing: {
      type: 'hourly',
      unitValue: 0,
      quantity: 0,
    },
    logo: {
      file: null,
      preview: '',
    },
    selectedTemplate: 1,
    finalized: false,
    finalizedDate: undefined,
  });

  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    setProposalData(prev => ({ 
      ...prev, 
      finalizedDate: formattedDate,
      signatureDate: formattedDate 
    }));
  }, []);

  const handlePeopleChange = (people: Person[]) => {
    setProposalData({ ...proposalData, people });
  };

  const handleServiceChange = (service: Service) => {
    setProposalData({ ...proposalData, service });
  };

  const handlePricingChange = (pricing: Pricing) => {
    setProposalData({ ...proposalData, pricing });
  };

  const handleLogoChange = (logo: Logo) => {
    setProposalData({ ...proposalData, logo });
  };

  const handleTemplateChange = (template: number) => {
    setProposalData({ ...proposalData, selectedTemplate: template });
  };

  const handleExportJson = () => {
    try {
      exportProposalToJson(proposalData);
      toast({
        title: 'Exportação concluída',
        description: 'Arquivo JSON gerado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o arquivo JSON.',
        variant: 'destructive',
      });
    }
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importProposalFromJson(file);
      setProposalData(data);
      setFormKey(prev => prev + 1);
      toast({
        title: 'Importação concluída',
        description: 'Proposta carregada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: error instanceof Error ? error.message : 'Arquivo inválido.',
        variant: 'destructive',
      });
    }
    
    if (importFileRef.current) {
      importFileRef.current.value = '';
    }
  };

  const handleFinalizeProposal = async () => {
    if (proposalData.people.length === 0) {
      toast({
        title: 'Erro ao finalizar',
        description: 'Adicione pelo menos uma pessoa à proposta.',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const nextProposalData: ProposalData = {
      ...proposalData,
      finalized: true,
      finalizedDate: formattedDate,
    };

    setProposalData(nextProposalData);

    toast({
      title: 'Proposta finalizada!',
      description: `Data: ${formattedDate}`,
    });

    try {
      await downloadProposalPdfTemplate(nextProposalData);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Não foi possível gerar o PDF. Tente novamente.';
      toast({
        title: 'Erro ao gerar PDF',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPdf = async () => {
    try {
      await downloadProposalPdfTemplate(proposalData);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Não foi possível gerar o PDF. Tente novamente.';
      toast({
        title: 'Erro ao gerar PDF',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleEditProposal = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    setProposalData({
      ...proposalData,
      finalized: false,
      finalizedDate: formattedDate,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <ModuleNav active="proposta" />
              <div>
                <h1 className="text-2xl font-bold">Gerador de Propostas Comerciais</h1>
                <p className="text-sm text-muted-foreground">
                  Crie propostas profissionais em tempo real
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="file" 
                ref={importFileRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleImportFile} 
              />
              <Button onClick={handleExportJson} variant="outline" size="icon" title="Exportar JSON">
                <Download className="h-4 w-4" />
              </Button>
              <Button onClick={handleImportClick} variant="outline" size="icon" title="Importar JSON">
                <Upload className="h-4 w-4" />
              </Button>

              {proposalData.finalized ? (
                <>
                  <Button onClick={handleDownloadPdf} size="lg">
                    <FileDown className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </Button>
                  <Button onClick={handleEditProposal} variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Editar Proposta
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleFinalizeProposal}
                    disabled={proposalData.people.length === 0}
                    size="lg"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Finalizar e Baixar PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left Column - Forms (40%) */}
        <div className="w-full lg:w-[40%] overflow-auto border-r bg-background">
          <div className="container mx-auto p-4 space-y-6">
            {/* Signature Date Field */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5" />
                  Data da Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="signatureDate">
                    Data que aparecerá no contrato
                  </Label>
                  <Input
                    id="signatureDate"
                    type="text"
                    placeholder="dd/mm/aaaa"
                    value={proposalData.signatureDate || ''}
                    onChange={(e) => setProposalData({ ...proposalData, signatureDate: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: dia/mês/ano (ex: 24/01/2026)
                  </p>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} key={formKey} className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-4">
                <TabsTrigger value="template" className="text-xs lg:text-sm">
                  <Layout className="mr-2 h-4 w-4 hidden lg:block" />
                  Template
                </TabsTrigger>
                <TabsTrigger value="people" className="text-xs lg:text-sm">
                  <Users className="mr-2 h-4 w-4 hidden lg:block" />
                  Pessoas
                </TabsTrigger>
                <TabsTrigger value="sections" className="text-xs lg:text-sm">
                  <FileText className="mr-2 h-4 w-4 hidden lg:block" />
                  Seções
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs lg:text-sm">
                  <DollarSign className="mr-2 h-4 w-4 hidden lg:block" />
                  Valores
                </TabsTrigger>
                <TabsTrigger value="logo" className="text-xs lg:text-sm hidden lg:flex">
                  <ImageIcon className="mr-2 h-4 w-4 hidden lg:block" />
                  Logo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="mt-4">
                <TemplateSelector
                  selectedTemplate={proposalData.selectedTemplate}
                  onTemplateChange={handleTemplateChange}
                />
              </TabsContent>

              <TabsContent value="people" className="mt-4">
                <PersonForm
                  people={proposalData.people}
                  onPeopleChange={handlePeopleChange}
                />
              </TabsContent>

              <TabsContent value="sections" className="mt-4">
                <ServiceSectionsEditor
                  service={proposalData.service}
                  onServiceChange={handleServiceChange}
                />
              </TabsContent>

              <TabsContent value="pricing" className="mt-4">
                <PricingForm
                  pricing={proposalData.pricing}
                  onPricingChange={handlePricingChange}
                  service={proposalData.service}
                  onServiceChange={handleServiceChange}
                />
              </TabsContent>

              <TabsContent value="logo" className="mt-4">
                <LogoUpload
                  logo={proposalData.logo}
                  onLogoChange={handleLogoChange}
                />
              </TabsContent>
            </Tabs>

            {/* Mobile Logo Tab */}
            <Card className="lg:hidden">
              <CardHeader>
                <CardTitle>Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <LogoUpload
                  logo={proposalData.logo}
                  onLogoChange={handleLogoChange}
                />
              </CardContent>
            </Card>

            {/* Quick Summary */}
            {proposalData.finalized && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                <CardHeader>
                  <CardTitle className="text-green-900 dark:text-green-100">
                    Proposta Finalizada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Data: {proposalData.finalizedDate}
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Status: Pronta para impressão
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Column - Preview (60%) */}
        <div className="w-full lg:w-[60%] overflow-auto">
          <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Preview em Tempo Real
                </h2>
                <span className="text-sm text-muted-foreground">
                  Template {proposalData.selectedTemplate}
                </span>
              </div>
            </div>
          </div>
          <ProposalPreview
            people={proposalData.people}
            service={proposalData.service}
            pricing={proposalData.pricing}
            logo={proposalData.logo}
            selectedTemplate={proposalData.selectedTemplate}
            finalized={proposalData.finalized}
            finalizedDate={proposalData.finalizedDate}
            signatureDate={proposalData.signatureDate}
          />
        </div>
      </div>
    </div>
  );
}
