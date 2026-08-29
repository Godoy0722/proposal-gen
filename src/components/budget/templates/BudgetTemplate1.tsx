'use client';

import { BudgetTemplateProps } from '@/types/budget';
import { BudgetTitleModern, BudgetPartiesCompact, BudgetProductsTable, BudgetFooter } from './budgetShared';

export function BudgetTemplate1({ header, client, items, desconto, logo, finalizedDate }: BudgetTemplateProps) {
  return (
    <div className="budget-document bg-white dark:bg-slate-900 p-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-3">
        <BudgetTitleModern finalizedDate={finalizedDate} />
        <div className="h-px bg-slate-200 dark:bg-slate-700" />
        <BudgetPartiesCompact header={header} client={client} variant="modern" />
        <BudgetProductsTable items={items} desconto={desconto} />
        <BudgetFooter header={header} logo={logo} variant="modern" />
      </div>
    </div>
  );
}
