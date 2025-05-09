
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormTemplate, FormSubmission, FormField } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FormViewer } from '@/components/forms/FormViewer';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

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

  // Load form template from Supabase or localStorage
  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!templateId) {
          throw new Error("ID del formulario no proporcionado");
        }
        
        // Try to get from Supabase first
        const { data, error } = await supabase
          .from('form_templates')
          .select('*')
          .eq('id', templateId)
          .single();
        
        if (error) {
          console.error("Error fetching from Supabase:", error);
          
          // Fallback to localStorage
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          const localTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
          
          if (localTemplate) {
            setTemplate(localTemplate);
          } else {
            throw new Error("Formulario no encontrado");
          }
        } else {
          // Process fields if they're stored as a JSON string
          let fields: FormField[] = [];
          
          // Check if fields is a string (JSON) and parse it
          if (typeof data.fields === 'string') {
            try {
              const parsedFields = JSON.parse(data.fields);
              if (Array.isArray(parsedFields)) {
                // Ensure each field conforms to FormField type
                fields = parsedFields.map(field => ({
                  id: String(field.id || ''),
                  name: String(field.name || ''),
                  label: String(field.label || ''),
                  type: (field.type as FormField['type']) || 'text',
                  required: Boolean(field.required),
                  options: Array.isArray(field.options) ? field.options.map(String) : undefined,
                  isNegativeIndicator: field.isNegativeIndicator ? Boolean(field.isNegativeIndicator) : undefined,
                  field_order: Number(field.field_order || 0)
                }));
              }
            } catch (e) {
              console.error("Error parsing fields:", e);
            }
          } else if (Array.isArray(data.fields)) {
            // If fields is already an array, map it to ensure type safety
            fields = (data.fields as Json[]).map(field => {
              if (typeof field === 'object' && field !== null) {
                return {
                  id: String(field.id || ''),
                  name: String(field.name || ''),
                  label: String(field.label || ''),
                  type: (field.type as FormField['type']) || 'text',
                  required: Boolean(field.required),
                  options: Array.isArray(field.options) ? field.options.map(String) : undefined,
                  isNegativeIndicator: field.isNegativeIndicator ? Boolean(field.isNegativeIndicator) : undefined,
                  field_order: Number(field.field_order || 0)
                };
              }
              // Return a default field if invalid data
              console.warn("Invalid field data, using default:", field);
              return {
                id: '',
                name: '',
                label: '',
                type: 'text',
                required: false,
                field_order: 0
              };
            });
          }
          
          setTemplate({
            ...data,
            fields: fields
          });
        }
      } catch (err) {
        console.error("Error loading template:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
  }, [templateId]);
  
  if (loading) {
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
          <Card className="p-8 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin mb-4"></div>
              <p>Cargando formulario...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  if (error) {
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
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">Error al cargar el formulario</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
            </div>
          </Card>
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
            <FormViewer 
              template={template}
              readOnly={submissionComplete}
              webhookUrl="https://n8n-n8n.qqtfab.easypanel.host/webhook-test/041274fe-3d47-4cdf-b4c2-114b661ef850"
              submissionComplete={submissionComplete}
              submissionData={submissionData}
              setSubmissionComplete={setSubmissionComplete}
              setSubmissionData={setSubmissionData}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
