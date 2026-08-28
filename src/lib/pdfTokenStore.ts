import type { ProposalData } from '@/types/proposal';
import { v4 as uuidv4 } from 'uuid';

type StoredPdfToken = {
  data: ProposalData;
  createdAt: number;
};

const STORE_KEY = '__proposal_pdf_token_store__';

function getStore(): Map<string, StoredPdfToken> {
  const globalAny = globalThis as any;
  if (!globalAny[STORE_KEY]) {
    globalAny[STORE_KEY] = new Map<string, StoredPdfToken>();
  }
  return globalAny[STORE_KEY] as Map<string, StoredPdfToken>;
}

function cleanup(store: Map<string, StoredPdfToken>, maxAgeMs: number) {
  const now = Date.now();
  for (const [token, entry] of store.entries()) {
    if (now - entry.createdAt > maxAgeMs) store.delete(token);
  }
}

export function createPdfToken(data: ProposalData) {
  const store = getStore();
  cleanup(store, 15 * 60 * 1000);

  const token = uuidv4();
  store.set(token, {
    createdAt: Date.now(),
    data: {
      ...data,
      logo: {
        file: null,
        preview: data.logo?.preview || '',
      },
    },
  });

  return token;
}

export function getPdfToken(token: string) {
  const store = getStore();
  cleanup(store, 15 * 60 * 1000);
  return store.get(token)?.data;
}

export function consumePdfToken(token: string) {
  const store = getStore();
  const value = store.get(token)?.data;
  store.delete(token);
  return value;
}

