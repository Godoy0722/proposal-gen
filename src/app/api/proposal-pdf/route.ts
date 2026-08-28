import { consumePdfToken, getPdfToken } from '@/lib/pdfTokenStore';

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

  const proposalData = getPdfToken(token);
  if (!proposalData) {
    return Response.json({ error: 'Token inválido ou expirado.' }, { status: 404 });
  }

  const finalizedIso = ddmmyyyyToIso(proposalData.finalizedDate) || new Date().toISOString().slice(0, 10);
  const filename = `proposta_template${proposalData.selectedTemplate}_${normalizeFilenamePart(finalizedIso)}.pdf`;

  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 1440, deviceScaleFactor: 1 });

    const previewUrl = new URL('/pdf/preview', url.origin);
    previewUrl.searchParams.set('token', token);

    await page.goto(previewUrl.toString(), { waitUntil: 'networkidle2' });
    await page.waitForSelector('#pdf-root[data-ready="true"]', { timeout: 30000 });
    await page.evaluate(async () => {
      const fonts = (document as any).fonts;
      if (fonts?.ready) await fonts.ready;
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true, // Respect @page margins from CSS
      displayHeaderFooter: true,
      headerTemplate: '<div></div>', // Empty header to maintain spacing if needed
      footerTemplate: `
        <div style="font-size: 9px; font-family: 'Roboto', sans-serif; color: #6b7280; width: 100%; text-align: right; padding-right: 20mm; margin-bottom: 10mm;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `,
      // When preferCSSPageSize is true, these margins might be ignored by some browsers/versions, 
      // but we keep them as fallback or for header/footer positioning context.
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }, 
    });

    consumePdfToken(token);
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

