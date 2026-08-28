import { NextResponse } from 'next/server';
import { createBudgetPdfToken } from '@/lib/budgetTokenStore';
import { normalizeBudgetHeader, normalizeBudgetClient } from '@/lib/budgetJsonIo';
import type { BudgetData } from '@/types/budget';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const json = (await req.json()) as Partial<BudgetData>;

  const budgetData: BudgetData = {
    header: normalizeBudgetHeader(json.header),
    client: normalizeBudgetClient(json.client),
    items: json.items || [],
    desconto: json.desconto || 0,
    selectedTemplate: json.selectedTemplate || 1,
    logo: { file: null, preview: json.logo?.preview || '' },
    finalized: Boolean(json.finalized),
    finalizedDate: json.finalizedDate,
  };

  const token = createBudgetPdfToken(budgetData);
  return NextResponse.json({ token });
}
