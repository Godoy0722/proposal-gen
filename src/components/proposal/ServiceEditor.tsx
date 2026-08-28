'use client';

import dynamic from 'next/dynamic';
import { Service } from '@/types/proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const MDXEditor = dynamic(() => import('@mdxeditor/editor').then(mod => ({ default: mod.MDXEditor })), {
  ssr: false,
  loading: () => <div className="min-h-[300px] flex items-center justify-center text-muted-foreground">Carregando editor...</div>
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

interface ServiceEditorProps {
  service: Service;
  onServiceChange: (service: Service) => void;
}

export function ServiceEditor({ service, onServiceChange }: ServiceEditorProps) {
  const handleMarkdownChange = (markdown: string) => {
    onServiceChange({ description: markdown });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Descrição dos Serviços</CardTitle>
        <CardDescription>
          Descreva os serviços ofertados de forma detalhada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Editor de Texto</Label>
          <div className="border rounded-lg overflow-hidden">
            <MDXEditor
              markdown={service.description}
              onChange={handleMarkdownChange}
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
              contentEditableClassName="prose prose-sm max-w-none dark:prose-invert min-h-[300px] p-4 focus:outline-none"
              placeholder="Digite a descrição dos serviços..."
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Use a barra de ferramentas acima para formatar o texto. O preview será atualizado automaticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}