
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FormSubmissionForm } from '@/components/forms/FormViewer/FormSubmissionForm';

export default function FillForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormSubmission | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load the template from localStorage
    const loadTemplate = async () => {
      try {
        setLoading(true);
        console.log("Intentando cargar formulario con ID:", templateId);
        
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
        
        if (foundTemplate) {
          console.log("Formulario encontrado:", foundTemplate.name);
          setTemplate(foundTemplate);
        } else {
          setError('Formulario no encontrado');
          console.error(`Formulario con ID ${templateId} no encontrado`, { storedTemplates });
        }
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Error al cargar el formulario');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
  }, [templateId]);

  // Reset form state when the template ID changes
  useEffect(() => {
    setSubmissionComplete(false);
    setSubmissionData(null);
    setError(null);
  }, [templateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#6EC1E4] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-[#2980b9]">Cargando formulario...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-4 md:p-8 text-center">
        <img 
          src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
          alt="Sepcon Logo" 
          className="h-12 md:h-16 mb-6"
        />
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-destructive text-xl font-medium mb-4">{error}</div>
          <p className="text-gray-600 mb-6">
            Es posible que este formulario ya no esté disponible o haya sido respondido anteriormente.
          </p>
          {/* Eliminamos el botón para evitar navegación no deseada */}
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] py-6 md:py-12 px-3 md:px-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-center mb-6 md:mb-8">
          <img 
            src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
            alt="Sepcon Logo" 
            className="h-12 md:h-16"
          />
        </div>
        
        {template && (
          <Card className="mx-auto">
            <FormSubmissionForm 
              template={template}
              readOnly={submissionComplete}
              webhookUrl="https://n8n-n8n.qqtfab.easypanel.host/webhook-test/041274fe-3d47-4cdf-b4c2-114b661ef850"
              setSubmissionComplete={setSubmissionComplete}
              setSubmissionData={setSubmissionData}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
