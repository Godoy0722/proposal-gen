'use client';

import dynamic from 'next/dynamic';
import { Service } from '@/types/proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileLock, Shield, Copyright, ListTodo, Clock, Package, X, Scale, Plus, FileText, CreditCard, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

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

interface ServiceSectionsEditorProps {
  service: Service;
  onServiceChange: (service: Service) => void;
}

const DEFAULT_SECTIONS = [
  {
    key: 'contractObject' as const,
    label: 'Objeto do Contrato',
    description: 'Definição clara do objeto e finalidade do contrato',
    icon: FileText,
    required: false
  },
  {
    key: 'payment' as const,
    label: 'Pagamento',
    description: 'Condições, formas e prazos de pagamento',
    icon: CreditCard,
    required: false
  },
  {
    key: 'confidentiality' as const,
    label: 'Confidencialidade',
    description: 'Termos de sigilo e proteção de informações',
    icon: FileLock,
    required: false
  },
  {
    key: 'privacy' as const,
    label: 'Privacidade e Proteção de Dados',
    description: 'Conformidade com LGPD e proteção de dados pessoais',
    icon: Shield,
    required: false
  },
  {
    key: 'intellectualProperty' as const,
    label: 'Propriedade Intelectual',
    description: 'Direitos sobre código-fonte e propriedade intelectual',
    icon: Copyright,
    required: false
  },
  {
    key: 'obligations' as const,
    label: 'Obrigações das Partes',
    description: 'Responsabilidades do contratante e contratada',
    icon: ListTodo,
    required: false
  },
  {
    key: 'termValidity' as const,
    label: 'Prazo e Vigência',
    description: 'Duração do contrato e prazos',
    icon: Clock,
    required: false
  },
  {
    key: 'delivery' as const,
    label: 'Recebimento e Entrega',
    description: 'Etapas de entrega e aceitação',
    icon: Package,
    required: false
  },
  {
    key: 'termination' as const,
    label: 'Rescisão',
    description: 'Condições para rescisão do contrato',
    icon: X,
    required: false
  },
  {
    key: 'disputeResolution' as const,
    label: 'Resolução de Disputas',
    description: 'Mecanismos de resolução de conflitos',
    icon: Scale,
    required: false
  },
  {
    key: 'additionalContent' as const,
    label: 'Conteúdo Adicional',
    description: 'Adicione seções personalizadas conforme necessário',
    icon: Plus,
    required: false
  },
];

export function ServiceSectionsEditor({ service, onServiceChange }: ServiceSectionsEditorProps) {
  const [enabledSections, setEnabledSections] = useState<Set<string>>(() => {
    const enabled = new Set<string>();
    DEFAULT_SECTIONS.forEach(section => {
      if (service[section.key] && service[section.key]!.trim() !== '') {
        enabled.add(section.key);
      }
    });
    return enabled;
  });

  // Initialize sections order if not exists
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(() => {
    if (service.sectionsOrder && service.sectionsOrder.length > 0) {
      return service.sectionsOrder;
    }
    return DEFAULT_SECTIONS.map(s => s.key);
  });

  // Get ordered sections
  const sections = sectionsOrder
    .map(key => DEFAULT_SECTIONS.find(s => s.key === key))
    .filter((s): s is typeof DEFAULT_SECTIONS[0] => s !== undefined);

  const handleSectionToggle = (sectionKey: string, enabled: boolean) => {
    const newEnabled = new Set(enabledSections);
    if (enabled) {
      newEnabled.add(sectionKey);
    } else {
      newEnabled.delete(sectionKey);
    }
    setEnabledSections(newEnabled);

    const updatedService = { ...service };
    if (!enabled) {
      (updatedService as any)[sectionKey] = '';
    } else if (!(updatedService as any)[sectionKey]) {
      (updatedService as any)[sectionKey] = '';
    }
    onServiceChange(updatedService);
  };

  const handleSectionChange = (sectionKey: string, content: string) => {
    onServiceChange({ ...service, [sectionKey]: content });
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...sectionsOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSectionsOrder(newOrder);
    onServiceChange({ ...service, sectionsOrder: newOrder });
  };

  const moveSectionDown = (index: number) => {
    if (index === sectionsOrder.length - 1) return;
    const newOrder = [...sectionsOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSectionsOrder(newOrder);
    onServiceChange({ ...service, sectionsOrder: newOrder });
  };

  const renderEditor = (sectionKey: string, content: string) => (
    <div className="border rounded-lg overflow-hidden mt-3">
      <MDXEditor
        markdown={content || ''}
        onChange={(markdown) => handleSectionChange(sectionKey, markdown)}
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
        placeholder={`Digite o conteúdo de ${sections.find(s => s.key === sectionKey)?.label}...`}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seções do Contrato</CardTitle>
        <CardDescription>
          Configure o título do contrato e adicione cláusulas contratuais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contract Title and Subtitle */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
          <div className="space-y-2">
            <Label htmlFor="contractTitle">Título do Contrato</Label>
            <Input
              id="contractTitle"
              value={service.contractTitle || ''}
              onChange={(e) => onServiceChange({ ...service, contractTitle: e.target.value })}
              placeholder="Ex: CONTRATO DE PRESTAÇÃO DE SERVIÇOS"
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar o título padrão
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractSubtitle">Subtítulo do Contrato</Label>
            <Input
              id="contractSubtitle"
              value={service.contractSubtitle || ''}
              onChange={(e) => onServiceChange({ ...service, contractSubtitle: e.target.value })}
              placeholder="Ex: Desenvolvimento e Manutenção de Software"
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para usar o subtítulo padrão
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Seções Opcionais</Label>
            <p className="text-xs text-muted-foreground">
              Use os botões ↑↓ para reordenar
            </p>
          </div>
          <Accordion type="multiple" className="w-full">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isEnabled = enabledSections.has(section.key);
              const content = service[section.key] || '';

              return (
                <AccordionItem key={section.key} value={section.key}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSectionUp(index);
                          }}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSectionDown(index);
                          }}
                          disabled={index === sections.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleSectionToggle(section.key, !!checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{section.label}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        {section.description}
                      </p>
                      {renderEditor(section.key, content)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          <p className="text-xs text-muted-foreground">
            Marque as seções que deseja incluir e use os botões ↑↓ para reordenar. As seções aparecem na proposta e no PDF na ordem definida aqui.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
