
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { FormViewer } from '@/components/forms/FormViewer';
import { useIsMobile } from '@/hooks/use-mobile';
import { FormLoader } from '@/components/forms/FormViewer/FormLoader';
import { LoadingState } from '@/components/forms/FormViewer/LoadingState';
import { ErrorState } from '@/components/forms/FormViewer/ErrorState';

export default function FillForm() {
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormSubmission | null>(null);
  
  // Use the hook to detect mobile devices
  const isMobile = useIsMobile();
  
  console.log("FillForm rendering with isMobile:", isMobile);
  console.log("Template ID:", templateId);
  console.log("Current loading state:", loading);
  
  // Handle template loading with the FormLoader component
  const handleTemplateLoaded = (loadedTemplate: FormTemplate) => {
    console.log("Template loaded successfully:", loadedTemplate);
    setTemplate(loadedTemplate);
    setError(null);
  };
  
  const handleLoadingError = (errorMessage: string) => {
    console.error("Error loading template:", errorMessage);
    setError(errorMessage);
  };
  
  const handleLoadingChange = (isLoading: boolean) => {
    console.log("Loading state changed to:", isLoading);
    setLoading(isLoading);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] py-3 px-2 sm:py-6 sm:px-3 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-center mb-4 sm:mb-6">
          <img 
            src="/lovable-uploads/6cc6cd56-15f0-4976-9b36-678dcf92dc52.png" 
            alt="Sepcon Logo" 
            className="h-10 sm:h-12 md:h-16"
          />
        </div>
        
        <FormLoader
          templateId={templateId}
          onLoaded={handleTemplateLoaded}
          onError={handleLoadingError}
          onLoadingChange={handleLoadingChange}
        />
        
        {loading && <LoadingState message="Cargando formulario..." />}
        
        {error && <ErrorState errorMessage={error} />}
        
        {!loading && !error && template && (
          <Card className="mx-auto overflow-hidden">
            <FormViewer 
              template={template}
              readOnly={submissionComplete}
              webhookUrl="https://n8n-n8n.qqtfab.easypanel.host/webhook-test/041274fe-3d47-4cdf-b4c2-114b661ef850"
              submissionComplete={submissionComplete}
              submissionData={submissionData}
              setSubmissionComplete={setSubmissionComplete}
              setSubmissionData={setSubmissionData}
              isMobile={isMobile}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
