
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FormSubmissionForm } from '@/components/forms/FormViewer/FormSubmissionForm';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load the template from Supabase, improved for mobile and shared links
    const loadTemplate = async () => {
      try {
        setLoading(true);
        console.log("Cargando formulario en dispositivo:", isMobile ? "móvil" : "escritorio");
        console.log("Intentando cargar formulario con ID:", templateId);
        
        // First try to load from Supabase
        try {
          // Fetch form from Supabase
          const { data: supabaseForm, error: supabaseError } = await supabase
            .from('form_templates')
            .select('*')
            .eq('id', templateId)
            .single();
          
          if (supabaseError) {
            console.warn("Error al cargar desde Supabase:", supabaseError);
            // Try loading from localStorage as a fallback
            const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
            const localTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
            
            if (localTemplate) {
              console.log("Formulario encontrado en localStorage:", localTemplate);
              setTemplate(localTemplate);
            } else {
              // Create a minimal template with default fields as a last resort
              const { data: basicTemplateInfo } = await supabase
                .from('form_templates')
                .select('id, name, description')
                .eq('id', templateId)
                .single();
                
              if (basicTemplateInfo) {
                console.log("Creando formulario mínimo a partir de información en Supabase");
                setTemplate({
                  id: basicTemplateInfo.id,
                  name: basicTemplateInfo.name,
                  description: basicTemplateInfo.description || "Formulario",
                  fields: [
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
                  ],
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              } else {
                setError('Formulario no encontrado');
              }
            }
          } else if (supabaseForm) {
            console.log("Formulario encontrado en Supabase:", supabaseForm);
            
            // Only check if form is active when loading from Supabase
            // IMPORTANT: Remove the active check to allow anyone with the link to access
            // if (supabaseForm.is_active === false) {
            //   setError('Este formulario ya no está activo');
            //   setLoading(false);
            //   return;
            // }
            
            // Get fields from localStorage if needed
            const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
            const localTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
            
            if (localTemplate && localTemplate.fields) {
              // Merge fields from localStorage with Supabase data
              setTemplate({
                ...supabaseForm,
                fields: localTemplate.fields,
                projectMetadata: localTemplate.projectMetadata
              });
            } else {
              // Use what we have from Supabase
              setTemplate(supabaseForm);
            }
          }
        } catch (supabaseErr) {
          console.warn("Error de conexión con Supabase:", supabaseErr);
          
          // Fallback to localStorage
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          const localTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
          
          if (localTemplate) {
            console.log("Formulario encontrado en localStorage (fallback):", localTemplate);
            setTemplate(localTemplate);
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
  }, [templateId, isMobile]);

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
