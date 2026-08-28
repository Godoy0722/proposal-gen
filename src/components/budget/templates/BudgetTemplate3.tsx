'use client';

import { BudgetTemplateProps } from '@/types/budget';
import { BudgetTitleTech, BudgetPartiesCompact, BudgetProductsTable } from './budgetShared';

export function BudgetTemplate3({ header, client, items, desconto, logo, finalizedDate }: BudgetTemplateProps) {
  return (
    <div className="budget-document bg-slate-50 dark:bg-slate-900 p-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 rounded-lg">
          <BudgetTitleTech finalizedDate={finalizedDate} logo={logo} />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
          <BudgetPartiesCompact header={header} client={client} variant="tech" />
        </div>
        <BudgetProductsTable items={items} desconto={desconto} />
      </div>
    </div>
  );
}
