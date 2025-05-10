
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FormSubmissionForm } from '@/components/forms/FormViewer/FormSubmissionForm';
import { Button } from '@/components/ui/button';
import { Clipboard, Home } from 'lucide-react';

export default function FillForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormSubmission | null>(null);
  const [availableForms, setAvailableForms] = useState<FormTemplate[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Load the template from localStorage
    const loadTemplate = async () => {
      try {
        setLoading(true);
        console.log("Intentando cargar formulario con ID:", templateId);
        
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
        
        // Guardar todos los formularios disponibles para mostrarlos como alternativa
        setAvailableForms(storedTemplates);
        
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
  
  // Función para copiar el ID al portapapeles
  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(templateId || '').then(
      () => {
        toast({
          title: "ID copiado al portapapeles",
          description: "El ID del formulario ha sido copiado",
        });
      },
      () => {
        toast({
          title: "Error",
          description: "No se pudo copiar el ID",
          variant: "destructive"
        });
      }
    );
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-4 md:p-8 text-center">
        <img 
          src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
          alt="Sepcon Logo" 
          className="h-12 md:h-16 mb-6"
        />
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-destructive text-xl font-medium mb-4">{error}</div>
          
          <div className="mb-6 text-left">
            <p className="text-gray-600 mb-4">
              Es posible que este formulario ya no esté disponible o que haya sido eliminado.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mb-4">
              <p className="text-amber-800 text-sm mb-2">ID del formulario que intentas acceder:</p>
              <div className="flex items-center gap-2 bg-amber-100 p-2 rounded">
                <code className="text-xs text-amber-900 font-mono flex-1 overflow-x-auto">{templateId}</code>
                <Button variant="outline" size="sm" onClick={copyIdToClipboard}>
                  <Clipboard className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {availableForms.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-2">Formularios disponibles:</p>
                <ul className="space-y-2">
                  {availableForms.slice(0, 5).map((form) => (
                    <li key={form.id} className="bg-white border rounded-md p-2">
                      <Link 
                        to={`/formularios/rellenar/${form.id}`}
                        className="text-blue-600 hover:underline block"
                      >
                        {form.name}
                      </Link>
                    </li>
                  ))}
                  {availableForms.length > 5 && (
                    <li className="text-sm text-gray-500">
                      Y {availableForms.length - 5} más...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="outline">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Ir al inicio
              </Link>
            </Button>
            
            {availableForms.length > 0 && (
              <Button asChild>
                <Link to={`/formularios/rellenar/${availableForms[0]?.id}`}>
                  Ver primer formulario disponible
                </Link>
              </Button>
            )}
          </div>
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
