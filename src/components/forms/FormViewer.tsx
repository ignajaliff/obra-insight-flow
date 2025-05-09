
import React from 'react';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { FormSubmissionForm } from './FormViewer/FormSubmissionForm';
import { FormSubmissionComplete } from './FormViewer/FormSubmissionComplete';

interface FormViewerProps {
  template: FormTemplate;
  readOnly?: boolean;
  webhookUrl?: string;
  submissionComplete?: boolean;
  submissionData?: FormSubmission | null;
  setSubmissionComplete?: (value: boolean) => void;
  setSubmissionData?: (data: FormSubmission) => void;
  isMobile?: boolean;
}

export function FormViewer({ 
  template, 
  readOnly = false, 
  webhookUrl,
  submissionComplete: externalSubmissionComplete,
  submissionData: externalSubmissionData,
  setSubmissionComplete: externalSetSubmissionComplete,
  setSubmissionData: externalSetSubmissionData,
  isMobile = false
}: FormViewerProps) {
  // Use external state if provided, otherwise use local state
  const [internalSubmissionComplete, setInternalSubmissionComplete] = React.useState(false);
  const [internalSubmissionData, setInternalSubmissionData] = React.useState<FormSubmission | null>(null);
  
  const submissionComplete = externalSubmissionComplete !== undefined ? externalSubmissionComplete : internalSubmissionComplete;
  const setSubmissionComplete = externalSetSubmissionComplete || setInternalSubmissionComplete;
  const submissionData = externalSubmissionData !== undefined ? externalSubmissionData : internalSubmissionData;
  const setSubmissionData = externalSetSubmissionData || setInternalSubmissionData;
  
  if (submissionComplete && submissionData) {
    return (
      <Card>
        <FormSubmissionComplete 
          template={template}
          submissionData={submissionData}
        />
      </Card>
    );
  }
  
  return (
    <Card>
      <FormSubmissionForm
        template={template}
        readOnly={readOnly}
        webhookUrl={webhookUrl}
        setSubmissionComplete={setSubmissionComplete}
        setSubmissionData={setSubmissionData}
        isMobile={isMobile}
      />
    </Card>
  );
}
