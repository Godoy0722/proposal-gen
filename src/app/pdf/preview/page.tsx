import { getPdfToken } from '@/lib/pdfTokenStore';
import { PdfTemplateRenderer } from '@/components/proposal/PdfTemplateRenderer';
import './pdf-preview.css';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function PdfPreviewPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const tokenRaw = searchParams.token;
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw;

  if (!token) {
    return (
      <div className="p-6 text-sm text-slate-700">
        Token ausente.
      </div>
    );
  }

  const proposalData = getPdfToken(token);
  if (!proposalData) {
    return (
      <div className="p-6 text-sm text-slate-700">
        Token inválido ou expirado.
      </div>
    );
  }

  return (
    <div className="pdf-page">
      <div id="pdf-root">
        <PdfTemplateRenderer
          people={proposalData.people}
          service={proposalData.service}
          pricing={proposalData.pricing}
          logo={proposalData.logo}
          selectedTemplate={proposalData.selectedTemplate}
          finalized={proposalData.finalized}
          finalizedDate={proposalData.finalizedDate}
        />
      </div>
    </div>
  );
}

