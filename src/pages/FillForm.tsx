
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FormSubmissionForm } from '@/components/forms/FormViewer/FormSubmissionForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function FillForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormSubmission | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Load the template from both Supabase and localStorage
    const loadTemplate = async () => {
      try {
        setLoading(true);
        console.log("Cargando formulario en dispositivo:", isMobile ? "móvil" : "escritorio");
        console.log("Intentando cargar formulario con ID:", templateId);
        
        // First try from Supabase to check if form is active
        let formIsActive = true;
        
        try {
          const { data: supabaseFormStatus, error: statusError } = await supabase
            .from('form_templates')
            .select('id, is_active')
            .eq('id', templateId)
            .single();
          
          console.log("Respuesta de Supabase sobre estado del formulario:", supabaseFormStatus);
          
          if (statusError) {
            console.warn("No se pudo verificar el estado del formulario en Supabase:", statusError);
            // Continue with localStorage approach if Supabase status check fails
          } else if (supabaseFormStatus && !supabaseFormStatus.is_active) {
            formIsActive = false;
            setError('Este formulario ya no está activo');
            setLoading(false);
            return;
          }
        } catch (supabaseErr) {
          console.warn("Error verificando estado en Supabase:", supabaseErr);
          // Continue with localStorage approach if Supabase fails
        }
        
        if (!formIsActive) {
          return;
        }
        
        // Then try from localStorage
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        let foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
        
        // If not found in localStorage, try from Supabase
        if (!foundTemplate) {
          console.log("Formulario no encontrado en localStorage, buscando en Supabase...");
          
          try {
            // Try to fetch from form_templates table in Supabase
            const { data: supabaseTemplate, error: supabaseError } = await supabase
              .from('form_templates')
              .select('*')
              .eq('id', templateId)
              .single();
              
            if (supabaseError) {
              console.error("Error de Supabase:", supabaseError);
              throw supabaseError;
            }
            
            if (supabaseTemplate) {
              console.log("Formulario encontrado en Supabase:", supabaseTemplate);
              
              // Try to load form data from localStorage using the ID
              const localFormData = storedTemplates.find((t: FormTemplate) => t.id === supabaseTemplate.id);
              
              if (localFormData) {
                // We have the form content in localStorage
                foundTemplate = localFormData;
              } else {
                // Get default form template (we need to create a minimal structure)
                foundTemplate = {
                  id: supabaseTemplate.id,
                  name: supabaseTemplate.name,
                  description: supabaseTemplate.description || "Formulario",
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
                  created_at: supabaseTemplate.created_at,
                  updated_at: supabaseTemplate.updated_at
                };
              }
            }
          } catch (supabaseErr) {
            console.error("Error buscando en Supabase:", supabaseErr);
            // Continue with localStorage approach if Supabase fails
          }
        }
        
        // Use whatever was found
        if (foundTemplate) {
          console.log("Formulario encontrado:", foundTemplate.name);
          console.log("Campos del formulario:", foundTemplate.fields?.length || 0);
          setTemplate(foundTemplate);
        } else {
          console.error(`Formulario con ID ${templateId} no encontrado`, { 
            storedTemplates,
            templateIds: storedTemplates.map((t: FormTemplate) => t.id)
          });
          setError('Formulario no encontrado');
        }
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Error al cargar el formulario');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
  }, [templateId, toast, isMobile]);

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
