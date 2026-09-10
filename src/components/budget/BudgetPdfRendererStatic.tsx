import type { BudgetTemplateProps } from '@/types/budget';
import { BudgetTemplate1 } from './templates/BudgetTemplate1';
import { BudgetTemplate2 } from './templates/BudgetTemplate2';
import { BudgetTemplate3 } from './templates/BudgetTemplate3';

interface BudgetPdfRendererStaticProps extends BudgetTemplateProps {
  selectedTemplate: number;
}

export function BudgetPdfRendererStatic({ selectedTemplate, ...props }: BudgetPdfRendererStaticProps) {
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
    <div className="pdf-page">
      <div id="pdf-root" data-ready="true">
        {content}
      </div>
    </div>
  );
}
