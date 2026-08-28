import type { BudgetData } from '@/types/budget';
import { v4 as uuidv4 } from 'uuid';

type StoredBudgetToken = {
  data: BudgetData;
  createdAt: number;
};

const STORE_KEY = '__budget_pdf_token_store__';

function getStore(): Map<string, StoredBudgetToken> {
  const globalAny = globalThis as Record<string, unknown>;
  if (!globalAny[STORE_KEY]) {
    globalAny[STORE_KEY] = new Map<string, StoredBudgetToken>();
  }
  return globalAny[STORE_KEY] as Map<string, StoredBudgetToken>;
}

function cleanup(store: Map<string, StoredBudgetToken>, maxAgeMs: number) {
  const now = Date.now();
  for (const [token, entry] of store.entries()) {
    if (now - entry.createdAt > maxAgeMs) store.delete(token);
  }
}

export function createBudgetPdfToken(data: BudgetData) {
  const store = getStore();
  cleanup(store, 15 * 60 * 1000);

  const token = uuidv4();
  store.set(token, {
    createdAt: Date.now(),
    data: {
      ...data,
      logo: { file: null, preview: data.logo?.preview || '' },
    },
  });

  return token;
}

export function getBudgetPdfToken(token: string) {
  const store = getStore();
  cleanup(store, 15 * 60 * 1000);
  return store.get(token)?.data;
}

export function consumeBudgetPdfToken(token: string) {
  const store = getStore();
  const value = store.get(token)?.data;
  store.delete(token);
  return value;
}
