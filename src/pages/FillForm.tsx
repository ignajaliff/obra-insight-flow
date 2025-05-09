
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FormSubmissionForm } from '@/components/forms/FormViewer/FormSubmissionForm';
import { FormLoader } from '@/components/forms/FormViewer/FormLoader';
import { LoadingState } from '@/components/forms/FormViewer/LoadingState';
import { ErrorState } from '@/components/forms/FormViewer/ErrorState';

export default function FillForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormSubmission | null>(null);
  const { toast } = useToast();
  
  // Simple mobile detection based on screen width
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Simple mobile detection function
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check immediately
    checkMobile();
    
    // Add listeners for resize
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);
  
  // Reset form state when the template ID changes
  useEffect(() => {
    setSubmissionComplete(false);
    setSubmissionData(null);
    setError(null);
    setLoading(true); // Asegurarse de que comienza en estado de carga
  }, [templateId]);

  // Handle successful template loading
  const handleTemplateLoaded = (loadedTemplate: FormTemplate) => {
    console.log("Template loaded successfully:", loadedTemplate);
    setTemplate(loadedTemplate);
    setError(null);
    setLoading(false);
  };

  // Handle template loading error
  const handleTemplateError = (errorMessage: string) => {
    console.error("Error loading template:", errorMessage);
    setError(errorMessage);
    setTemplate(null);
    setLoading(false);
  };

  // Handle loading state changes
  const handleLoadingChange = (isLoading: boolean) => {
    console.log("Loading state changed to:", isLoading);
    setLoading(isLoading);
  };

  if (loading) {
    return <LoadingState message="Cargando formulario..." />;
  }
  
  if (error) {
    return <ErrorState errorMessage={error} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] py-3 px-2 sm:py-6 sm:px-3 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-center mb-4 sm:mb-6">
          <img 
            src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
            alt="Sepcon Logo" 
            className="h-10 sm:h-12 md:h-16"
          />
        </div>
        
        {/* Form Loader Component */}
        <FormLoader
          templateId={templateId}
          onLoaded={handleTemplateLoaded}
          onError={handleTemplateError}
          onLoadingChange={handleLoadingChange}
        />
        
        {template && (
          <Card className="mx-auto overflow-hidden">
            <FormSubmissionForm 
              template={template}
              readOnly={submissionComplete}
              webhookUrl="https://n8n-n8n.qqtfab.easypanel.host/webhook-test/041274fe-3d47-4cdf-b4c2-114b661ef850"
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
