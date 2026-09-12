import type { BudgetItem } from '@/types/budget';

export function getItemGrossTotal(item: BudgetItem): number {
  return item.valorUnitario * item.quantidade;
}

export function capItemDiscount(valorUnitario: number, quantidade: number, descontoItem: number): number {
  const gross = valorUnitario * quantidade;
  if (!descontoItem || descontoItem <= 0) return 0;
  return Math.min(descontoItem, gross);
}

export function getItemDiscount(item: BudgetItem): number {
  return capItemDiscount(item.valorUnitario, item.quantidade, item.descontoItem ?? 0);
}

/** Total da linha após desconto do item. */
export function getItemTotal(item: BudgetItem): number {
  return getItemGrossTotal(item) - getItemDiscount(item);
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
