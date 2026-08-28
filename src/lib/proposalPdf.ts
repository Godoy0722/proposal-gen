import type { ProposalData, ServiceItem } from '@/types/proposal';

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

function stripTagsToText(input: string) {
  return input
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function markdownToPlainText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, (m) => stripTagsToText(m.replace(/```/g, ' ')))
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeFilenamePart(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function ddmmyyyyToIso(date: string | undefined) {
  if (!date) return undefined;
  const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function toPtBrMoney(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildServicesTableBody(services: ServiceItem[]) {
  return [
    [
      { text: 'Entregável / Serviço', style: 'tableHeader' },
      { text: 'Detalhes', style: 'tableHeader' },
      { text: 'Prazo (horas)', style: 'tableHeader', alignment: 'center' },
      { text: 'Valor (R$)', style: 'tableHeader', alignment: 'right' },
    ],
    ...services.map((service) => [
      { text: service.titulo || '-', style: 'tableCellStrong' },
      { text: service.descricao || '-', style: 'tableCell' },
      { text: String(service.prazo || 0), style: 'tableCell', alignment: 'center' },
      { text: `R$ ${toPtBrMoney(service.valor || 0)}`, style: 'tableCell', alignment: 'right' },
    ]),
  ];
}

export async function downloadProposalPdf(proposalData: ProposalData) {
  if (typeof window === 'undefined') {
    throw new Error('Geração de PDF disponível apenas no navegador.');
  }

  const [pdfMakeModule, pdfFontsModule, htmlToPdfmakeModule, markedModule] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
    import('html-to-pdfmake'),
    import('marked'),
  ]);

  const pdfMakeAny: any = (pdfMakeModule as any).default ?? (pdfMakeModule as any);
  const vfsModuleAny: any = pdfFontsModule as any;
  const vfsCandidate: any = vfsModuleAny.default ?? vfsModuleAny;
  const vfs: any =
    vfsCandidate?.['Roboto-Regular.ttf'] ? vfsCandidate : vfsCandidate?.pdfMake?.vfs ?? vfsModuleAny?.pdfMake?.vfs;
  if (!vfs) {
    throw new Error('Falha ao carregar fontes do PDF.');
  }
  if (typeof pdfMakeAny.addVirtualFileSystem === 'function') {
    pdfMakeAny.addVirtualFileSystem(vfs);
  } else {
    pdfMakeAny.vfs = vfs;
  }

  const htmlToPdfmake: any = (htmlToPdfmakeModule as any).default ?? (htmlToPdfmakeModule as any);
  if (typeof htmlToPdfmake !== 'function') {
    throw new Error('Falha ao carregar conversor de HTML para PDF.');
  }

  const markedAny: any = (markedModule as any).marked ?? (markedModule as any).default ?? (markedModule as any);
  const renderMarkdownToHtml = (markdown: string) => {
    if (typeof markedAny?.parse === 'function') return markedAny.parse(markdown, { breaks: true }) as string;
    if (typeof markedAny === 'function') return markedAny(markdown, { breaks: true }) as string;
    throw new Error('Falha ao carregar parser de Markdown.');
  };

  const contractors = proposalData.people.filter((p) => p.type === 'CONTRATANTE');
  const contracted = proposalData.people.filter((p) => p.type === 'CONTRATADA');
  const services = proposalData.pricing.services || [];

  const totalValue =
    proposalData.pricing.type === 'hourly'
      ? proposalData.pricing.unitValue * proposalData.pricing.quantity
      : services.reduce((sum, s) => sum + (s.valor || 0), 0);

  const totalHours =
    proposalData.pricing.type === 'hourly'
      ? proposalData.pricing.quantity
      : services.reduce((sum, s) => sum + (s.prazo || 0), 0);

  const showTotalValue = proposalData.pricing.showTotalValue !== false;

  // Section configuration for ordered rendering
  const sectionConfig: Record<string, string> = {
    contractObject: 'Objeto do Contrato',
    payment: 'Pagamento',
    confidentiality: 'Confidencialidade',
    privacy: 'Privacidade e Proteção de Dados',
    intellectualProperty: 'Propriedade Intelectual',
    obligations: 'Obrigações das Partes',
    termValidity: 'Prazo e Vigência',
    delivery: 'Recebimento e Entrega',
    termination: 'Rescisão',
    disputeResolution: 'Resolução de Disputas',
    additionalContent: 'Conteúdo Adicional',
  };

  const defaultOrder = ['contractObject', 'payment', 'confidentiality', 'privacy', 'intellectualProperty', 'obligations', 'termValidity', 'delivery', 'termination', 'disputeResolution', 'additionalContent'];
  const sectionsOrder = proposalData.service.sectionsOrder || defaultOrder;
  const orderedSections = sectionsOrder
    .map(key => ({ key, title: sectionConfig[key], content: (proposalData.service as any)[key] }))
    .filter(s => s.content && s.content.trim() !== '' && s.title);

  const markdownToPdf = (markdown: string | undefined) => {
    const raw = markdown?.trim() ? markdown : '-';
    try {
      const html = sanitizeHtml(renderMarkdownToHtml(raw));
      const content = htmlToPdfmake(html, {
        window,
        defaultStyles: {
          p: { margin: [0, 0, 0, 8] },
          li: { margin: [0, 0, 0, 2] },
          a: { color: '#2563eb', decoration: 'underline' },
          h1: { margin: [0, 12, 0, 8] },
          h2: { margin: [0, 12, 0, 6] },
          h3: { margin: [0, 10, 0, 6] },
        },
      });

      if (Array.isArray(content)) return { stack: content };
      return { stack: [content] };
    } catch {
      return { text: markdownToPlainText(raw) || '-', preserveLeadingSpaces: true };
    }
  };

  const section = (title: string, markdown: string | undefined) => [
    { text: title, style: 'sectionTitle', keepWithNext: true },
    { ...markdownToPdf(markdown), style: 'sectionBody', margin: [0, 0, 0, 14] },
  ];

  const finalizedIso = ddmmyyyyToIso(proposalData.finalizedDate) || new Date().toISOString().slice(0, 10);
  const filename = `proposta_${normalizeFilenamePart(finalizedIso)}.pdf`;

  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [48, 56, 48, 56],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10.5,
      lineHeight: 1.25,
      color: '#111827',
    },
    footer: (currentPage: number, pageCount: number) => ({
      margin: [48, 0, 48, 20],
      columns: [
        {
          text: proposalData.finalizedDate ? `Data: ${proposalData.finalizedDate}` : '',
          fontSize: 8.5,
          color: '#6b7280',
        },
        {
          text: `${currentPage} / ${pageCount}`,
          alignment: 'right',
          fontSize: 8.5,
          color: '#6b7280',
        },
      ],
    }),
    styles: {
      title: { fontSize: 20, bold: true },
      subtitle: { fontSize: 11, color: '#4b5563' },
      sectionTitle: { fontSize: 12.5, bold: true, margin: [0, 14, 0, 8] },
      sectionBody: { color: '#111827' },
      smallMuted: { fontSize: 9, color: '#6b7280' },
      pill: { fontSize: 9, color: '#0f172a' },
      tableHeader: { bold: true, fillColor: '#f3f4f6', margin: [0, 6, 0, 6] },
      tableCell: { margin: [0, 6, 0, 6] },
      tableCellStrong: { bold: true, margin: [0, 6, 0, 6] },
    },
    content: [
      {
        columns: [
          proposalData.logo.preview
            ? { image: proposalData.logo.preview, fit: [140, 54], margin: [0, 0, 0, 0] }
            : { text: '' },
          {
            width: '*',
            stack: [
              { text: proposalData.service.contractTitle || 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS', style: 'title', alignment: 'right' },
              { text: proposalData.service.contractSubtitle || 'Desenvolvimento e Manutenção de Software', style: 'subtitle', alignment: 'right', margin: [0, 4, 0, 0] },
            ],
          },
        ],
        columnGap: 16,
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 499, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }], margin: [0, 16, 0, 8] },
      { text: 'Partes Envolvidas', style: 'sectionTitle', keepWithNext: true },
      {
        table: {
          widths: ['*', '*'],
          body: [
            [
              { text: 'Contratante(s)', style: 'tableHeader' },
              { text: 'Contratada(s)', style: 'tableHeader' },
            ],
            [
              contractors.length
                ? {
                    stack: contractors.map((p) => ({
                      stack: [
                        { text: p.nomeCompleto || '-', bold: true },
                        { text: p.cpfCnpj || '-', style: 'smallMuted' },
                        { text: p.email || '-', style: 'smallMuted' },
                      ],
                      margin: [0, 0, 0, 10],
                    })),
                  }
                : { text: 'Não informado', italics: true, color: '#6b7280' },
              contracted.length
                ? {
                    stack: contracted.map((p) => ({
                      stack: [
                        { text: p.nomeCompleto || '-', bold: true },
                        { text: p.cpfCnpj || '-', style: 'smallMuted' },
                        { text: p.email || '-', style: 'smallMuted' },
                      ],
                      margin: [0, 0, 0, 10],
                    })),
                  }
                : { text: 'Não informado', italics: true, color: '#6b7280' },
            ],
          ],
        },
        layout: {
          hLineColor: () => '#e5e7eb',
          vLineColor: () => '#e5e7eb',
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 8,
          paddingBottom: () => 8,
        },
        margin: [0, 0, 0, 12],
      },
      // Ordered sections
      ...orderedSections.flatMap(s => section(s.title, s.content)),
      // Services clauses before investment
      ...(proposalData.service.servicesClauses && proposalData.service.servicesClauses.trim() !== '' 
        ? section('Cláusulas dos Serviços', proposalData.service.servicesClauses)
        : []),
      // Investimento section - Moved to end before signatures
      { text: 'Investimento', style: 'sectionTitle', keepWithNext: true },
      proposalData.pricing.type === 'hourly'
        ? {
            table: {
              widths: ['*', '*', 70, 90],
              body: [
                [
                  { text: 'Entregável / Serviço', style: 'tableHeader' },
                  { text: 'Detalhes', style: 'tableHeader' },
                  { text: 'Prazo (horas)', style: 'tableHeader', alignment: 'center' },
                  { text: 'Valor (R$)', style: 'tableHeader', alignment: 'right' },
                ],
                [
                  { text: 'Desenvolvimento por Horas', style: 'tableCellStrong' },
                  {
                    text: `${proposalData.pricing.quantity} hora(s) × R$ ${toPtBrMoney(proposalData.pricing.unitValue)}`,
                    style: 'tableCell',
                  },
                  { text: String(proposalData.pricing.quantity), style: 'tableCell', alignment: 'center' },
                  { text: `R$ ${toPtBrMoney(totalValue)}`, style: 'tableCell', alignment: 'right' },
                ],
                ...(showTotalValue ? [[
                  { text: 'Total do Projeto', colSpan: 3, style: 'tableCellStrong' },
                  {},
                  {},
                  { text: `R$ ${toPtBrMoney(totalValue)}`, style: 'tableCellStrong', alignment: 'right' },
                ]] : []),
              ],
            },
            layout: {
              hLineColor: () => '#e5e7eb',
              vLineColor: () => '#e5e7eb',
              paddingLeft: () => 10,
              paddingRight: () => 10,
              paddingTop: () => 2,
              paddingBottom: () => 2,
            },
            margin: [0, 0, 0, 10],
          }
        : {
            table: {
              headerRows: 1,
              keepWithHeaderRows: 1,
              dontBreakRows: true,
              widths: ['*', '*', 70, 90],
              body: [
                ...buildServicesTableBody(services),
                ...(showTotalValue ? [[
                  { text: 'Total do Projeto', colSpan: 3, style: 'tableCellStrong' },
                  {},
                  {},
                  { text: `R$ ${toPtBrMoney(totalValue)}`, style: 'tableCellStrong', alignment: 'right' },
                ]] : []),
              ],
            },
            layout: {
              hLineColor: () => '#e5e7eb',
              vLineColor: () => '#e5e7eb',
              paddingLeft: () => 10,
              paddingRight: () => 10,
              paddingTop: () => 2,
              paddingBottom: () => 2,
            },
            margin: [0, 0, 0, 10],
          },
      { text: 'Assinaturas', style: 'sectionTitle', keepWithNext: true },
      ...(proposalData.signatureDate
        ? [
            {
              text: [
                { text: 'Data da proposta: ', fontSize: 10, color: '#6b7280' },
                { text: proposalData.signatureDate, fontSize: 11, bold: true, color: '#1f2937' },
              ],
              alignment: 'center',
              margin: [0, 0, 0, 12],
            },
          ]
        : []),
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'CONTRATANTE', fontSize: 9, bold: true, color: '#6b7280', margin: [0, 0, 0, 6] },
              { text: ' ', margin: [0, 16, 0, 0] },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1.5, lineColor: '#9ca3af' }] },
              { text: 'Assinatura', fontSize: 8, color: '#9ca3af', italics: true, alignment: 'center', margin: [0, 4, 0, 0] },
              { text: ' ', margin: [0, 12, 0, 0] },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 0.5, lineColor: '#d1d5db' }] },
              { text: 'Nome completo', fontSize: 8, color: '#9ca3af', alignment: 'center', margin: [0, 2, 0, 0] },
            ],
          },
          {
            width: '*',
            stack: [
              { text: 'CONTRATADA', fontSize: 9, bold: true, color: '#6b7280', margin: [0, 0, 0, 6] },
              { text: ' ', margin: [0, 16, 0, 0] },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1.5, lineColor: '#9ca3af' }] },
              { text: 'Assinatura', fontSize: 8, color: '#9ca3af', italics: true, alignment: 'center', margin: [0, 4, 0, 0] },
              { text: ' ', margin: [0, 12, 0, 0] },
              { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 0.5, lineColor: '#d1d5db' }] },
              { text: 'Nome completo', fontSize: 8, color: '#9ca3af', alignment: 'center', margin: [0, 2, 0, 0] },
            ],
          },
        ],
        columnGap: 24,
      },
    ],
  };

  pdfMakeAny.createPdf(docDefinition).download(filename);
}

