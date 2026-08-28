'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: number;
  onTemplateChange: (template: number) => void;
}

interface Template {
  id: number;
  name: string;
  description: string;
  previewColor: string;
}

const templates: Template[] = [
  {
    id: 1,
    name: 'Moderno Técnico',
    description: 'Design clean com elementos visuais de tecnologia, ideal para propostas de desenvolvimento ágil',
    previewColor: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
  },
  {
    id: 2,
    name: 'Corporativo Formal',
    description: 'Estilo técnico tradicional, perfeito para contratos corporativos e projetos formais',
    previewColor: 'from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900',
  },
  {
    id: 3,
    name: 'Tech Professional',
    description: 'Design moderno tech-focused com cards informativos, ideal para propostas técnicas detalhadas',
    previewColor: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
  },
];

export function TemplateSelector({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione o Template</CardTitle>
        <CardDescription>
          Escolha o design da proposta comercial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onTemplateChange(template.id)}
              className={`relative w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedTemplate === template.id
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2">
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
              <div className={`h-20 rounded-md mb-3 bg-gradient-to-br ${template.previewColor}`} />
              <div>
                <h3 className="font-semibold mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
