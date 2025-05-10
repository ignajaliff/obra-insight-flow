import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FormSubmissionForm } from '@/components/forms/FormViewer/FormSubmissionForm';
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { RefreshCcw, AlertCircle, Home, Copy } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseToTemplate, convertSupabaseTemplateList } from '@/utils/supabaseConverters';

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
    // Load the template from Supabase
    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Intentando cargar template con ID:', templateId);
        
        // Get template from Supabase
        const { data, error } = await supabase
          .from('form_templates')
          .select('*')
          .eq('id', templateId)
          .single();
        
        if (error) {
          console.error('Error fetching template from Supabase:', error);
          throw error;
        }
        
        if (data) {
          console.log('Template encontrado:', data.name);
          const convertedTemplate = convertSupabaseToTemplate(data);
          setTemplate(convertedTemplate);
        } else {
          console.error('Template no encontrado con ID:', templateId);
          setError('Formulario no encontrado');
        }
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Error al cargar el formulario');
        
        // Check if template exists in localStorage as fallback
        try {
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
          
          if (foundTemplate) {
            console.log('Template encontrado en localStorage:', foundTemplate.name);
            setTemplate(foundTemplate);
            setError(null);
          }
        } catch (localErr) {
          console.error('Error checking localStorage templates:', localErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
  }, [templateId]);

  const handleRetry = async () => {
    setError(null);
    setLoading(true);
    
    // Try to load the template again from Supabase
    try {
      console.log('Reintentando cargar template con ID:', templateId);
      
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (error) {
        console.error('Error fetching template from Supabase on retry:', error);
        throw error;
      }
      
      if (data) {
        console.log('Template encontrado en reintentar:', data.name);
        const convertedTemplate = convertSupabaseToTemplate(data);
        setTemplate(convertedTemplate);
        setError(null);
      } else {
        console.error('Template no encontrado en reintentar con ID:', templateId);
        setError('Formulario no encontrado');
      }
    } catch (err) {
      console.error('Error reintentando cargar template:', err);
      setError('Error al cargar el formulario');
      
      // Fallback to localStorage
      try {
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
        
        if (foundTemplate) {
          console.log('Template encontrado en localStorage (reintentar):', foundTemplate.name);
          setTemplate(foundTemplate);
          setError(null);
        }
      } catch (localErr) {
        console.error('Error checking localStorage templates on retry:', localErr);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const copyTemplateId = () => {
    if (templateId) {
      navigator.clipboard.writeText(templateId);
      toast({
        title: "ID copiado",
        description: "El ID del formulario ha sido copiado al portapapeles."
      });
    }
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
    // Get all available form templates for suggestions
    const [availableTemplates, setAvailableTemplates] = useState<FormTemplate[]>([]);
    
    useEffect(() => {
      const fetchAvailableTemplates = async () => {
        try {
          // Try to get templates from Supabase first
          const { data, error } = await supabase
            .from('form_templates')
            .select('id, name')
            .limit(5);
          
          if (!error && data && data.length > 0) {
            // Create simplified template objects with required fields
            const templates: FormTemplate[] = data.map(item => ({
              id: item.id,
              name: item.name,
              fields: [],
              created_at: '',
              updated_at: ''
            }));
            setAvailableTemplates(templates);
            return;
          }
          
          // Fallback to localStorage
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          setAvailableTemplates(storedTemplates);
        } catch (e) {
          console.error('Error fetching template suggestions:', e);
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          setAvailableTemplates(storedTemplates);
        }
      };
      
      fetchAvailableTemplates();
    }, []);
    
    const hasOtherForms = availableTemplates.length > 0;
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-8 space-y-6">
        <img 
          src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
          alt="Sepcon Logo" 
          className="h-16 mb-4"
        />
        
        <Card className="w-full max-w-2xl p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-lg">
                El formulario con ID <span className="font-mono text-sm bg-muted p-1 rounded">{templateId}</span> no se encontró en el sistema.
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={copyTemplateId}
                className="ml-2 flex-shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            {hasOtherForms && (
              <div className="space-y-2">
                <p className="font-medium">Formularios disponibles:</p>
                <ul className="space-y-2">
                  {availableTemplates.map((t: FormTemplate) => (
                    <li key={t.id} className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{t.name}</p>
                          <p className="text-sm text-muted-foreground">{t.id}</p>
                        </div>
                        <Button asChild size="sm">
                          <Link to={`/formularios/rellenar/${t.id}`}>
                            Abrir
                          </Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button onClick={handleRetry} className="w-full sm:w-auto">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reintentar cargar
              </Button>
              
              <Button onClick={() => navigate('/')} variant="outline" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </div>
          </div>
        </Card>
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
            <FormSubmissionForm 
              template={template}
              readOnly={submissionComplete}
              webhookUrl="https://n8n-n8n.qqtfab.easypanel.host/webhook-test/041274fe-3d47-4cdf-b4c2-114b661ef850"
              setSubmissionComplete={setSubmissionComplete}
              setSubmissionData={setSubmissionData}
              useSupabase={true}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
