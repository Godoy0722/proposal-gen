'use client';

import { TemplateProps } from '@/types/proposal';
import { Template1 } from './templates/Template1';
import { Template2 } from './templates/Template2';
import { Template3 } from './templates/Template3';

interface ProposalPreviewProps extends TemplateProps {
  selectedTemplate: number;
}

export function ProposalPreview({ selectedTemplate, ...props }: ProposalPreviewProps) {
  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 1:
        return <Template1 {...props} />;
      case 2:
        return <Template2 {...props} />;
      case 3:
        return <Template3 {...props} />;
      default:
        return <Template1 {...props} />;
    }
  };

  return (
    <div className="h-full overflow-auto bg-gray-100 dark:bg-gray-950">
      <div className="min-h-full">
        {renderTemplate()}
      </div>
    </div>
  );
}
