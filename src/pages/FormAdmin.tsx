
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FormTemplate } from '@/types/forms';
import { FormTemplateEditor } from '@/components/forms/FormTemplateEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectInfoDetail } from '@/components/forms/FormBuilder/ProjectInfoDetail';
import { ArrowLeft, Share, Pencil, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FormViewer } from '@/components/forms/FormViewer';

export default function FormAdmin() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('details');
  const { toast } = useToast();

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
          // Process fields if they're stored as JSON
          let fields = [];
          try {
            fields = typeof data.fields === 'string' ? JSON.parse(data.fields) : data.fields;
          } catch (parseError) {
            console.error("Error parsing fields:", parseError);
            fields = [];
          }
          
          setTemplate({
            ...data,
            fields: Array.isArray(fields) ? fields : []
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

  const handleSave = async (updatedTemplate: FormTemplate) => {
    try {
      // Update local state
      setTemplate(updatedTemplate);
      
      // Update localStorage
      const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
      const updatedTemplates = storedTemplates.map((t: FormTemplate) => 
        t.id === updatedTemplate.id ? updatedTemplate : t
      );
      localStorage.setItem('formTemplates', JSON.stringify(updatedTemplates));
      
      // Update in Supabase
      const { error } = await supabase
        .from('form_templates')
        .update({
          name: updatedTemplate.name,
          description: updatedTemplate.description,
          fields: JSON.stringify(updatedTemplate.fields),
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedTemplate.id);
      
      if (error) {
        console.error("Error updating in Supabase:", error);
        // We don't throw here to avoid disrupting the user experience
        // since localStorage update succeeded
      }
      
      setIsEditing(false);
      toast({
        title: "Formulario actualizado",
        description: "Los cambios se guardaron correctamente."
      });
      
    } catch (err) {
      console.error("Error saving template:", err);
      toast({
        title: "Error",
        description: "No se pudo guardar el formulario.",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = () => {
    if (template) {
      const url = `${window.location.origin}/formularios/rellenar/${template.id}`;
      navigator.clipboard.writeText(url);
      toast({
        title: "Enlace copiado",
        description: "El enlace se ha copiado al portapapeles."
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/formularios">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Cargando formulario...</h1>
        </div>
        
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/formularios">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <p>{error}</p>
            <Button 
              onClick={() => navigate('/formularios')} 
              className="mt-4"
            >
              Volver a mis formularios
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEditing && template) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(false)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancelar edición
          </Button>
          <h1 className="text-2xl font-bold">Editando formulario</h1>
        </div>
        
        <FormTemplateEditor 
          template={template} 
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/formularios">
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{template?.name || 'Formulario'}</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyLink}>
            <Share className="mr-2 h-4 w-4" /> Compartir
          </Button>
          <Button onClick={() => setIsEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Editar
          </Button>
        </div>
      </div>
      
      {template && (
        <Card>
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="details">Detalles</TabsTrigger>
                <TabsTrigger value="preview">Vista Previa</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="space-y-4">
                  {template.description && (
                    <div>
                      <h3 className="font-medium mb-1">Descripción</h3>
                      <p className="text-muted-foreground">{template.description}</p>
                    </div>
                  )}
                  
                  {/* Project Information Section */}
                  <ProjectInfoDetail template={template} />
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Campos del formulario</h3>
                    {template.fields.length === 0 ? (
                      <p className="text-muted-foreground">No hay campos definidos en este formulario.</p>
                    ) : (
                      <div className="space-y-2">
                        {template.fields.map((field, index) => (
                          <Card key={field.id} className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{field.label}</p>
                                <p className="text-sm text-muted-foreground">
                                  Tipo: {field.type} {field.required ? "• Obligatorio" : ""}
                                </p>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                #{index + 1}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-3">Enlace público</h3>
                    <div className="flex items-center gap-2">
                      <div className="bg-muted p-2 rounded flex-1 text-sm overflow-hidden overflow-ellipsis">
                        {window.location.origin}/formularios/rellenar/{template.id}
                      </div>
                      <Button variant="outline" size="sm" onClick={handleCopyLink}>
                        Copiar
                      </Button>
                    </div>
                    <Button 
                      className="mt-4" 
                      variant="outline"
                      onClick={() => window.open(`/formularios/rellenar/${template.id}`, '_blank')}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Ver formulario
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preview">
                {template && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta es una vista previa de cómo se ve su formulario. Los datos ingresados aquí no serán enviados.
                    </p>
                    <FormViewer template={template} readOnly={false} />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
