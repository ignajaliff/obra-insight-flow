
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { FormViewer } from '@/components/forms/FormViewer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function FillForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormSubmission | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Cargar el template desde Supabase o localStorage como fallback
    const loadTemplate = async () => {
      try {
        console.info("Intentando cargar template con ID:", templateId);
        setLoading(true);
        
        // Primero intentar cargar desde Supabase
        try {
          const { data: templateData, error: supabaseError } = await supabase
            .from('form_templates')
            .select('*')
            .eq('id', templateId)
            .single();
          
          if (supabaseError) {
            console.error("Error fetching template from Supabase:", supabaseError);
            throw supabaseError;
          }
          
          if (templateData) {
            // Convertir los campos JSON a objetos
            const parsedTemplate: FormTemplate = {
              ...templateData,
              fields: Array.isArray(templateData.fields) 
                ? templateData.fields 
                : JSON.parse(templateData.fields as unknown as string),
              projectMetadata: templateData.project_metadata 
                ? (typeof templateData.project_metadata === 'string' 
                  ? JSON.parse(templateData.project_metadata) 
                  : templateData.project_metadata)
                : {}
            };
            
            setTemplate(parsedTemplate);
            setLoading(false);
            return;
          }
        } catch (supabaseError) {
          // Si hay un error en Supabase, continuamos con localStorage
          console.error("Error loading template from Supabase:", supabaseError);
        }
        
        // Fallback a localStorage
        try {
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
          
          if (foundTemplate) {
            setTemplate(foundTemplate);
          } else {
            setError('Formulario no encontrado');
          }
        } catch (localStorageError) {
          console.error('Error loading template from localStorage:', localStorageError);
          setError('Error al cargar el formulario');
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
  
  const handleHome = () => {
    navigate('/');
  };

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
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-8 space-y-6">
        <div className="text-[#e74c3c] text-3xl font-bold mb-2">Formulario no encontrado</div>
        <p className="text-[#34495e] text-center mb-6">
          El formulario que estás buscando no existe o ha sido eliminado.
        </p>
        <Button onClick={handleHome} variant="default" size="lg" className="px-8">
          Volver al inicio
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
            alt="Sepcon Logo" 
            className="h-16"
          />
        </div>
        
        {template && (
          <Card>
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
