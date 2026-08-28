import { getBudgetPdfToken } from '@/lib/budgetTokenStore';
import { BudgetPdfRenderer } from '@/components/budget/BudgetPdfRenderer';
import '../preview/pdf-preview.css';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function BudgetPdfPreviewPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const tokenRaw = searchParams.token;
  const token = Array.isArray(tokenRaw) ? tokenRaw[0] : tokenRaw;

  if (!token) {
    return <div className="p-6 text-sm text-slate-700">Token ausente.</div>;
  }

  const budgetData = getBudgetPdfToken(token);
  if (!budgetData) {
    return <div className="p-6 text-sm text-slate-700">Token inválido ou expirado.</div>;
  }

  return (
    <div className="pdf-page">
      <div id="pdf-root">
        <BudgetPdfRenderer
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
  );
}
