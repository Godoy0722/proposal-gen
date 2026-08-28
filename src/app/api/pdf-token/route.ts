import { NextResponse } from 'next/server';
import { createPdfToken } from '@/lib/pdfTokenStore';
import type { ProposalData } from '@/types/proposal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const json = (await req.json()) as Partial<ProposalData>;

  const proposalData: ProposalData = {
    people: json.people || [],
    service: json.service || { description: '' },
    pricing: json.pricing || { type: 'hourly', unitValue: 0, quantity: 0, services: [] },
    logo: { file: null, preview: json.logo?.preview || '' },
    selectedTemplate: json.selectedTemplate || 1,
    finalized: Boolean(json.finalized),
    finalizedDate: json.finalizedDate,
    signatureDate: json.signatureDate,
  };

  const token = createPdfToken(proposalData);
  return NextResponse.json({ token });
}

