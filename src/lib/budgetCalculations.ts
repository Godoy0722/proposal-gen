import type { BudgetItem } from '@/types/budget';

export function getItemTotal(item: BudgetItem): number {
  return item.valorUnitario * item.quantidade;
}

export function getSubtotal(items: BudgetItem[]): number {
  return items.reduce((sum, item) => sum + getItemTotal(item), 0);
}

export function getDiscountAmount(subtotal: number, desconto: number): number {
  if (!desconto || desconto <= 0) return 0;
  return subtotal * (desconto / 100);
}

export function getFinalTotal(items: BudgetItem[], desconto: number): number {
  const subtotal = getSubtotal(items);
  return subtotal - getDiscountAmount(subtotal, desconto);
}
