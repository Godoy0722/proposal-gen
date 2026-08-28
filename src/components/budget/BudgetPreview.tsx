'use client';

import { BudgetTemplateProps } from '@/types/budget';
import { BudgetTemplate1 } from './templates/BudgetTemplate1';
import { BudgetTemplate2 } from './templates/BudgetTemplate2';
import { BudgetTemplate3 } from './templates/BudgetTemplate3';

interface BudgetPreviewProps extends BudgetTemplateProps {
  selectedTemplate: number;
}

export function BudgetPreview({ selectedTemplate, ...props }: BudgetPreviewProps) {
  const content = (() => {
    switch (selectedTemplate) {
      case 2:
        return <BudgetTemplate2 {...props} />;
      case 3:
        return <BudgetTemplate3 {...props} />;
      default:
        return <BudgetTemplate1 {...props} />;
    }
  })();

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen">
      {content}
    </div>
  );
}
