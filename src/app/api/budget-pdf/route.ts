import { consumeBudgetPdfToken, getBudgetPdfToken } from '@/lib/budgetTokenStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return Response.json({ error: 'Token ausente.' }, { status: 400 });
  }

  const budgetData = getBudgetPdfToken(token);
  if (!budgetData) {
    return Response.json({ error: 'Token inválido ou expirado.' }, { status: 404 });
  }

  const finalizedIso = ddmmyyyyToIso(budgetData.finalizedDate) || new Date().toISOString().slice(0, 10);
  const filename = `orcamento_template${budgetData.selectedTemplate}_${normalizeFilenamePart(finalizedIso)}.pdf`;

  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 1440, deviceScaleFactor: 1 });

    const previewUrl = new URL('/pdf/budget-preview', url.origin);
    previewUrl.searchParams.set('token', token);

    await page.goto(previewUrl.toString(), { waitUntil: 'networkidle2' });
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

    consumeBudgetPdfToken(token);
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } finally {
    await browser.close();
  }
}
