'use client';

import { useEffect } from 'react';
import type { TemplateProps } from '@/types/proposal';
import { Template1 } from './templates/Template1';
import { Template2 } from './templates/Template2';
import { Template3 } from './templates/Template3';

interface PdfTemplateRendererProps extends TemplateProps {
  selectedTemplate: number;
}

export function PdfTemplateRenderer({ selectedTemplate, ...props }: PdfTemplateRendererProps) {
  useEffect(() => {
    const el = document.getElementById('pdf-root');
    el?.setAttribute('data-ready', 'true');
  }, []);

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
}

