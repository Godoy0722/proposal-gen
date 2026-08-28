import type { ProposalData } from '@/types/proposal';

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

function getDefaultFilename(proposalData: ProposalData) {
  const finalizedIso = ddmmyyyyToIso(proposalData.finalizedDate) || new Date().toISOString().slice(0, 10);
  return `proposta_template${proposalData.selectedTemplate}_${normalizeFilenamePart(finalizedIso)}.pdf`;
}

export async function downloadProposalPdfTemplate(proposalData: ProposalData) {
  const tokenRes = await fetch('/api/pdf-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proposalData),
  });

  if (!tokenRes.ok) {
    throw new Error('Não foi possível preparar o PDF.');
  }

  const tokenJson = (await tokenRes.json()) as { token?: string };
  if (!tokenJson.token) {
    throw new Error('Não foi possível preparar o PDF.');
  }

  const pdfRes = await fetch(`/api/proposal-pdf?token=${encodeURIComponent(tokenJson.token)}`);
  if (!pdfRes.ok) {
    let message = 'Não foi possível gerar o PDF.';
    try {
      const err = (await pdfRes.json()) as { error?: string };
      if (err?.error) message = err.error;
    } catch {}
    throw new Error(message);
  }

  const blob = await pdfRes.blob();
  const url = URL.createObjectURL(blob);
  const filename = getDefaultFilename(proposalData);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

