
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormTemplate, FormField } from '@/types/forms';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ClipboardCopy, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export default function MyForms() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    toast({
      title: "Enlace copiado",
      description: "El enlace del formulario ha sido copiado al portapapeles."
    });
  };
  
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        
        // Get templates from localStorage
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        
        // Try to get from Supabase as well
        try {
          const { data: supabaseTemplates, error } = await supabase
            .from('form_templates')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) {
            throw error;
          }
          
          // Process Supabase templates to ensure they match our FormTemplate type
          const processedTemplates = supabaseTemplates.map((template: any) => {
            // Process fields if they're stored as a JSON string
            let fields: FormField[] = [];
            
            // Check if fields is a string (JSON) and parse it
            if (typeof template.fields === 'string') {
              try {
                const parsedFields = JSON.parse(template.fields);
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
                console.error("Error parsing fields for template:", template.id, e);
              }
            } else if (Array.isArray(template.fields)) {
              // If fields is already an array, map it to ensure type safety
              fields = template.fields.map((field: any) => {
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
            
            return {
              id: template.id,
              name: template.name,
              description: template.description || '',
              fields: fields,
              created_at: template.created_at,
              updated_at: template.updated_at,
              public_url: template.public_url,
              is_active: template.is_active
            };
          });
          
          // Combine templates from both sources, with Supabase taking precedence for duplicates
          const combinedTemplates = [...storedTemplates];
          
          // Add templates from Supabase, replacing any with the same ID
          processedTemplates.forEach(supaTemplate => {
            const existingIndex = combinedTemplates.findIndex(t => t.id === supaTemplate.id);
            if (existingIndex >= 0) {
              combinedTemplates[existingIndex] = supaTemplate;
            } else {
              combinedTemplates.push(supaTemplate);
            }
          });
          
          setTemplates(combinedTemplates);
        } catch (err) {
          console.error("Error loading templates from Supabase:", err);
          // Fall back to just localStorage templates
          setTemplates(storedTemplates);
        }
      } catch (err) {
        console.error("Error loading templates:", err);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, []);
  
  if (loading) {
    return (
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mis Formularios</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Formularios</h1>
        <Button asChild>
          <Link to="/formularios/crear" className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Formulario
          </Link>
        </Button>
      </div>
      
      {templates.length === 0 ? (
        <Card className="text-center p-8">
          <div className="flex flex-col items-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No tienes formularios</h3>
            <p className="text-muted-foreground mb-6">
              Crea tu primer formulario para empezar a recolectar datos
            </p>
            <Button asChild>
              <Link to="/formularios/crear" className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Formulario
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {template.fields.length} campos
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyToClipboard(template.public_url || `/formularios/rellenar/${template.id}`)}
                  >
                    <ClipboardCopy className="h-3.5 w-3.5 mr-2" />
                    Compartir
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="flex-1"
                  >
                    <Link to={`/formularios/rellenar/${template.id}`}>
                      Ver
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
