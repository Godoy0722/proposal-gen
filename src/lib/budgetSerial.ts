const STORAGE_KEY = 'proposal_gen_budget_serial';
const INITIAL_SERIAL = 592;

function readCounter(): number {
  if (typeof window === 'undefined') return 0;
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function writeCounter(value: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(value));
}

export function peekNextBudgetSerial(): number {
  const counter = readCounter();
  if (counter === 0) return INITIAL_SERIAL;
  return counter + 1;
}

/** Reserves the next serial and persists it immediately (on page open). */
export function reserveNextBudgetSerial(): number {
  const next = peekNextBudgetSerial();
  writeCounter(next);
  return next;
}

/** Ensures the counter is at least as high as the given serial (on finalize/import). */
export function confirmBudgetSerial(serial: number): number {
  const counter = readCounter();
  if (serial > counter) writeCounter(serial);
  return serial;
}
