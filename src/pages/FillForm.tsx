
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FormSubmissionForm } from '@/components/forms/FormViewer/FormSubmissionForm';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function FillForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormSubmission | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
  
  useEffect(() => {
    // Load the template
    const loadTemplate = async () => {
      try {
        setLoading(true);
        
        if (!templateId) {
          setError('ID de formulario no proporcionado');
          setLoading(false);
          return;
        }

        // Try to load from Supabase first
        let formFound = false;
        
        try {
          // Try to get the form from Supabase
          const { data: form, error } = await supabase
            .from('form_templates')
            .select('*')
            .eq('id', templateId)
            .single();
          
          if (form && !error) {
            // We have the basic form info, but we need to ensure it has fields
            const formWithFields = {
              ...form,
              fields: form.fields || [
                {
                  id: "1",
                  name: "worker_name",
                  label: "Nombre del Trabajador",
                  type: "text",
                  required: true,
                  field_order: 0
                },
                {
                  id: "2",
                  name: "proyecto",
                  label: "Proyecto",
                  type: "text",
                  required: true,
                  field_order: 1
                }
              ]
            };
            
            setTemplate(formWithFields);
            formFound = true;
          }
        } catch (e) {
          // Continue to localStorage fallback
          console.error("Error al obtener formulario de Supabase:", e);
        }
        
        // If we didn't find the form in Supabase, try localStorage
        if (!formFound) {
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          const localTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
          
          if (localTemplate) {
            setTemplate(localTemplate);
            formFound = true;
          } else {
            setError('Formulario no encontrado');
          }
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#2980b9] animate-spin" />
          <p className="text-lg font-medium text-[#2980b9]">Cargando formulario...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-4 md:p-8 text-center">
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
          
          <Button 
            className="w-full bg-[#5DADE2] hover:bg-[#3498DB]" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
        </div>
      </div>
    );
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
