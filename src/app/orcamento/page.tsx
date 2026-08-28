'use client';

import { useState, useEffect, useRef } from 'react';
import { BudgetHeaderForm } from '@/components/budget/BudgetHeaderForm';
import { BudgetItemsForm } from '@/components/budget/BudgetItemsForm';
import { BudgetPreview } from '@/components/budget/BudgetPreview';
import { TemplateSelector } from '@/components/proposal/TemplateSelector';
import { ModuleNav } from '@/components/ModuleNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, FileText, Building2, Package, Layout, Upload, Download, Image as ImageIcon } from 'lucide-react';
import { BudgetData, BudgetHeader, BudgetClient, BudgetItem } from '@/types/budget';
import { Logo } from '@/types/proposal';
import { useToast } from '@/hooks/use-toast';
import { downloadBudgetPdf } from '@/lib/budgetPdfTemplate';
import { exportBudgetToJson, importBudgetFromJson } from '@/lib/budgetJsonIo';
import { LogoUpload } from '@/components/proposal/LogoUpload';

const emptyHeader: BudgetHeader = {
  nomeEmpresa: '',
  cnpj: '',
  inscricaoEstadual: '',
  enderecoCompleto: '',
  cidade: '',
  estado: '',
  cep: '',
};

const emptyClient: BudgetClient = {
  nomeCliente: '',
  veiculo: '',
};

export default function OrcamentoPage() {
  const { toast } = useToast();
  const importFileRef = useRef<HTMLInputElement>(null);
  const [formKey, setFormKey] = useState(0);
  const [activeTab, setActiveTab] = useState('template');
  const [budgetData, setBudgetData] = useState<BudgetData>({
    header: emptyHeader,
    client: emptyClient,
    items: [],
    desconto: 0,
    selectedTemplate: 1,
    logo: { file: null, preview: '' },
    finalized: false,
  });

  useEffect(() => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    setBudgetData((prev) => ({ ...prev, finalizedDate: formattedDate }));
  }, []);

  const isFormValid = () => {
    const { header, client } = budgetData;
    return Boolean(
      client.nomeCliente.trim() &&
      header.nomeEmpresa.trim() &&
      header.cnpj.trim() &&
      header.enderecoCompleto.trim() &&
      header.cidade.trim() &&
      header.estado &&
      header.cep.trim()
    );
  };

  const canFinalize = isFormValid() && budgetData.items.length > 0;

  const handleExportJson = () => {
    try {
      exportBudgetToJson(budgetData);
      toast({ title: 'Exportação concluída', description: 'Arquivo JSON gerado com sucesso.' });
    } catch {
      toast({ title: 'Erro na exportação', description: 'Não foi possível gerar o arquivo JSON.', variant: 'destructive' });
    }
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importBudgetFromJson(file);
      setBudgetData(data);
      setFormKey((prev) => prev + 1);
      toast({ title: 'Importação concluída', description: 'Orçamento carregado com sucesso.' });
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: error instanceof Error ? error.message : 'Arquivo inválido.',
        variant: 'destructive',
      });
    }

    if (importFileRef.current) importFileRef.current.value = '';
  };

  const handleDownloadPdf = async (data: BudgetData) => {
    try {
      await downloadBudgetPdf(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível gerar o PDF.';
      toast({ title: 'Erro ao gerar PDF', description: message, variant: 'destructive' });
    }
  };

  const handleFinalize = async () => {
    if (!canFinalize) {
      toast({
        title: 'Campos incompletos',
        description: 'Preencha os dados do cliente, cabeçalho e adicione pelo menos um produto.',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const nextData: BudgetData = { ...budgetData, finalized: true, finalizedDate: formattedDate };
    setBudgetData(nextData);

    toast({ title: 'Orçamento finalizado!', description: `Data: ${formattedDate}` });
    await handleDownloadPdf(nextData);
  };

  const handleEdit = () => {
    setBudgetData({ ...budgetData, finalized: false });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <ModuleNav active="orcamento" />
              <div>
                <h1 className="text-2xl font-bold">Gerador de Orçamentos</h1>
                <p className="text-sm text-muted-foreground">
                  Crie orçamentos simplificados em tempo real
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
              {budgetData.finalized ? (
                <>
                  <Button onClick={() => handleDownloadPdf(budgetData)} size="lg">
                    <FileDown className="mr-2 h-4 w-4" />
                    Baixar PDF
                  </Button>
                  <Button onClick={handleEdit} variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Editar Orçamento
                  </Button>
                </>
              ) : (
                <Button onClick={handleFinalize} disabled={!canFinalize} size="lg">
                  <FileDown className="mr-2 h-4 w-4" />
                  Finalizar e Baixar PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        <div className="w-full lg:w-[40%] overflow-auto border-r bg-background">
          <div className="container mx-auto p-4 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} key={formKey} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-4">
                <TabsTrigger value="template" className="text-xs lg:text-sm">
                  <Layout className="mr-2 h-4 w-4 hidden lg:block" />
                  Template
                </TabsTrigger>
                <TabsTrigger value="header" className="text-xs lg:text-sm">
                  <Building2 className="mr-2 h-4 w-4 hidden lg:block" />
                  Cabeçalho
                </TabsTrigger>
                <TabsTrigger value="items" className="text-xs lg:text-sm">
                  <Package className="mr-2 h-4 w-4 hidden lg:block" />
                  Produtos
                </TabsTrigger>
                <TabsTrigger value="logo" className="text-xs lg:text-sm">
                  <ImageIcon className="mr-2 h-4 w-4 hidden lg:block" />
                  Logo
                </TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="mt-4">
                <TemplateSelector
                  selectedTemplate={budgetData.selectedTemplate}
                  onTemplateChange={(template) => setBudgetData({ ...budgetData, selectedTemplate: template })}
                />
              </TabsContent>

              <TabsContent value="header" className="mt-4">
                <BudgetHeaderForm
                  header={budgetData.header}
                  client={budgetData.client}
                  onHeaderChange={(header) => setBudgetData({ ...budgetData, header })}
                  onClientChange={(client) => setBudgetData({ ...budgetData, client })}
                />
              </TabsContent>

              <TabsContent value="items" className="mt-4">
                <BudgetItemsForm
                  items={budgetData.items}
                  desconto={budgetData.desconto}
                  onItemsChange={(items: BudgetItem[]) => setBudgetData({ ...budgetData, items })}
                  onDescontoChange={(desconto) => setBudgetData({ ...budgetData, desconto })}
                />
              </TabsContent>

              <TabsContent value="logo" className="mt-4">
                <LogoUpload
                  logo={budgetData.logo}
                  onLogoChange={(logo: Logo) => setBudgetData({ ...budgetData, logo })}
                />
              </TabsContent>
            </Tabs>

            {budgetData.finalized && (
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
                <CardHeader>
                  <CardTitle className="text-green-900 dark:text-green-100">
                    Orçamento Finalizado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Data: {budgetData.finalizedDate}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[60%] overflow-auto">
          <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
            <div className="container mx-auto flex items-center justify-between">
              <h2 className="text-lg font-semibold">Preview em Tempo Real</h2>
              <span className="text-sm text-muted-foreground">
                Template {budgetData.selectedTemplate}
              </span>
            </div>
          </div>
          <BudgetPreview
            header={budgetData.header}
            client={budgetData.client}
            items={budgetData.items}
            desconto={budgetData.desconto}
            logo={budgetData.logo}
            selectedTemplate={budgetData.selectedTemplate}
            finalized={budgetData.finalized}
            finalizedDate={budgetData.finalizedDate}
          />
        </div>
      </div>
    </div>
  );
}
