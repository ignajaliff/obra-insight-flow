
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormTemplate } from '@/types/forms';
import { FormViewer } from '@/components/forms/FormViewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Copy, Link as LinkIcon, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ViewForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Cargar el template desde localStorage
    const loadTemplate = () => {
      try {
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
        
        if (foundTemplate) {
          setTemplate(foundTemplate);
        } else {
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
  }, [templateId]);

  const copyFormLink = () => {
    const url = `${window.location.origin}/formularios/rellenar/${templateId}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Enlace copiado",
      description: "El enlace del formulario ha sido copiado al portapapeles."
    });
  };
  
  if (loading) {
    return <div className="flex justify-center p-8">Cargando formulario...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-destructive text-lg font-medium">{error}</div>
        <Button asChild>
          <Link to="/formularios/mis-formularios">Volver a mis formularios</Link>
        </Button>
      </div>
    );
  }
  
  const hasProjectMetadata = template?.projectMetadata && Object.values(template?.projectMetadata).some(val => !!val);
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link to="/formularios/mis-formularios">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a mis formularios
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Ver formulario</h1>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyFormLink}>
              <Copy className="mr-2 h-4 w-4" /> Copiar enlace
            </Button>
            
            <Button asChild variant="outline" size="sm">
              <Link to={`/formularios/rellenar/${templateId}`}>
                <LinkIcon className="mr-2 h-4 w-4" /> Abrir formulario
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {template && (
        <Card>
          <Tabs defaultValue="preview">
            <TabsList className="w-full">
              <TabsTrigger value="preview" className="flex-1">Vista previa</TabsTrigger>
              {hasProjectMetadata && (
                <TabsTrigger value="metadata" className="flex-1">
                  <ClipboardList className="mr-2 h-4 w-4" /> Información del proyecto
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="preview">
              <FormViewer template={template} readOnly={true} />
            </TabsContent>
            
            {hasProjectMetadata && (
              <TabsContent value="metadata">
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Información del proyecto</h2>
                  <p className="text-muted-foreground text-sm">
                    Esta información no es visible para quienes completan el formulario, 
                    pero se envía junto con las respuestas.
                  </p>
                  
                  <div className="border rounded-md p-4 space-y-3">
                    {Object.entries(template.projectMetadata || {}).map(([key, value]) => {
                      if (!value) return null;
                      const readableKey = key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase());
                      
                      return (
                        <div key={key} className="grid grid-cols-3">
                          <span className="font-medium">{readableKey}:</span>
                          <span className="col-span-2">{value}</span>
                        </div>
                      );
                    })}
                    
                    {!hasProjectMetadata && (
                      <p className="text-muted-foreground">No hay información adicional configurada.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </Card>
      )}
    </div>
  );
}
