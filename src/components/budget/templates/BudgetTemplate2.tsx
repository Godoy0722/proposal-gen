'use client';

import { BudgetTemplateProps } from '@/types/budget';
import { BudgetTitleFormal, BudgetPartiesCompact, BudgetProductsTable, BudgetFooter } from './budgetShared';

export function BudgetTemplate2({ header, client, items, desconto, logo, finalizedDate }: BudgetTemplateProps) {
  return (
    <div className="budget-document bg-white dark:bg-slate-900 p-4 font-serif">
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="border-b-2 border-slate-800 dark:border-slate-200 pb-2">
          <BudgetTitleFormal finalizedDate={finalizedDate} />
        </div>
        <BudgetPartiesCompact header={header} client={client} variant="formal" />
        <BudgetProductsTable items={items} desconto={desconto} />
        <BudgetFooter header={header} logo={logo} variant="formal" />
      </div>
    </div>
  );
}
