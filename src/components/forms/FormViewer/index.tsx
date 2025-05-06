
import React, { useState } from 'react';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { FormSubmissionForm } from './FormSubmissionForm';
import { FormSubmissionComplete } from './FormSubmissionComplete';

interface FormViewerProps {
  template: FormTemplate;
  readOnly?: boolean;
  webhookUrl?: string;
}

export function FormViewer({ template, readOnly = false, webhookUrl }: FormViewerProps) {
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormSubmission | null>(null);
  
  if (!template) {
    return <div className="text-center p-8">Formulario no encontrado</div>;
  }
  
  if (submissionComplete && submissionData) {
    return <FormSubmissionComplete template={template} submissionData={submissionData} />;
  }
  
  return (
    <Card>
      <FormSubmissionForm
        template={template}
        readOnly={readOnly}
        webhookUrl={webhookUrl}
        setSubmissionComplete={setSubmissionComplete}
        setSubmissionData={setSubmissionData}
      />
    </Card>
  );
}
