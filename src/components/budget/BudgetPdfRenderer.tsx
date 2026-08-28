'use client';

import { useEffect } from 'react';
import type { BudgetTemplateProps } from '@/types/budget';
import { BudgetTemplate1 } from './templates/BudgetTemplate1';
import { BudgetTemplate2 } from './templates/BudgetTemplate2';
import { BudgetTemplate3 } from './templates/BudgetTemplate3';

interface BudgetPdfRendererProps extends BudgetTemplateProps {
  selectedTemplate: number;
}

export function BudgetPdfRenderer({ selectedTemplate, ...props }: BudgetPdfRendererProps) {
  useEffect(() => {
    const el = document.getElementById('pdf-root');
    el?.setAttribute('data-ready', 'true');
  }, []);

  switch (selectedTemplate) {
    case 2:
      return <BudgetTemplate2 {...props} />;
    case 3:
      return <BudgetTemplate3 {...props} />;
    default:
      return <BudgetTemplate1 {...props} />;
  }
}
