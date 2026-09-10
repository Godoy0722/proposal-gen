import { readFileSync } from 'fs';
import path from 'path';
import { createElement } from 'react';
import { BudgetPdfRendererStatic } from '@/components/budget/BudgetPdfRendererStatic';
import { launchBrowser } from '@/lib/launchBrowser';
import { normalizeBudgetHeader, normalizeBudgetClient, normalizeBudgetItems } from '@/lib/budgetJsonIo';
import type { BudgetData } from '@/types/budget';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function ddmmyyyyToIso(date: string | undefined) {
  if (!date) return undefined;
  const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeFilenamePart(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

async function renderBudgetPdfHtml(budgetData: BudgetData) {
  const { renderToStaticMarkup } = await import('react-dom/server');
  const body = renderToStaticMarkup(
    createElement(BudgetPdfRendererStatic, {
      header: budgetData.header,
      client: budgetData.client,
      items: budgetData.items,
      desconto: budgetData.desconto,
      logo: budgetData.logo,
      selectedTemplate: budgetData.selectedTemplate,
      finalized: budgetData.finalized,
      finalizedDate: budgetData.finalizedDate,
    }),
  );

  const cssPath = path.join(process.cwd(), 'src/app/pdf/preview/pdf-preview.css');
  const css = readFileSync(cssPath, 'utf8');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>${css}</style>
</head>
<body>${body}</body>
</html>`;
}

function parseBudgetData(json: Partial<BudgetData>): BudgetData {
  return {
    header: normalizeBudgetHeader(json.header),
    client: normalizeBudgetClient(json.client),
    items: normalizeBudgetItems(json.items),
    desconto: json.desconto || 0,
    selectedTemplate: json.selectedTemplate || 1,
    logo: { file: null, preview: json.logo?.preview || '' },
    finalized: Boolean(json.finalized),
    finalizedDate: json.finalizedDate,
  };
}

export async function POST(req: Request) {
  let budgetData: BudgetData;
  try {
    budgetData = parseBudgetData((await req.json()) as Partial<BudgetData>);
  } catch {
    return Response.json({ error: 'Dados inválidos.' }, { status: 400 });
  }

  const finalizedIso = ddmmyyyyToIso(budgetData.finalizedDate) || new Date().toISOString().slice(0, 10);
  const filename = `orcamento_template${budgetData.selectedTemplate}_${normalizeFilenamePart(finalizedIso)}.pdf`;

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 1440, deviceScaleFactor: 1 });

    const html = await renderBudgetPdfHtml(budgetData);
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForSelector('#pdf-root[data-ready="true"]', { timeout: 30000 });
    await page.evaluate(async () => {
      const fonts = (document as Document & { fonts?: { ready?: Promise<void> } }).fonts;
      if (fonts?.ready) await fonts.ready;
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 9px; font-family: 'Roboto', sans-serif; color: #6b7280; width: 100%; text-align: right; padding-right: 20mm; margin-bottom: 10mm;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('budget-pdf error:', error);
    return Response.json({ error: 'Não foi possível gerar o PDF.' }, { status: 500 });
  } finally {
    await browser.close();
  }
}
