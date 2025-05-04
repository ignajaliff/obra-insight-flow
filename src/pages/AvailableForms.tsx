
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormTemplate } from '@/pages/FormAdmin';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AvailableForms = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        // Obtener todas las plantillas
        const { data: templateData, error: templateError } = await supabase
          .from('form_templates')
          .select('*')
          .order('updated_at', { ascending: false });
        
        if (templateError) throw templateError;
        
        // Para cada plantilla, obtener sus campos
        const templatesWithFields = await Promise.all(templateData.map(async (template) => {
          const { data: fieldData, error: fieldError } = await supabase
            .from('form_fields')
            .select('*')
            .eq('template_id', template.id)
            .order('field_order', { ascending: true });
          
          if (fieldError) throw fieldError;
          
          // Convertir campos de BD a formato de la aplicación
          const fields = fieldData.map(field => ({
            id: field.id,
            name: field.name,
            label: field.label,
            type: field.field_type,
            required: field.required || false,
            options: field.options,
            isNegativeIndicator: field.is_negative_indicator || false,
            field_order: field.field_order
          }));
          
          return {
            id: template.id,
            name: template.name,
            description: template.description || '',
            fields,
            created_at: template.created_at,
            updated_at: template.updated_at
          };
        }));
        
        setTemplates(templatesWithFields);
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las plantillas de formularios",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplates();
  }, [toast]);

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Formularios Disponibles</h1>
          <p className="text-muted-foreground">
            Selecciona un formulario para completar
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.length > 0 ? (
            templates.map((template) => (
              <Card key={template.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm">
                    {template.fields.length} campos en total
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link to={`/formularios/rellenar/${template.id}`}>
                      <FileText className="mr-2 h-4 w-4" />
                      Completar Formulario
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center p-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-xl font-medium mb-1">No hay formularios disponibles</h3>
              <p className="text-muted-foreground">
                No se encontraron formularios para completar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableForms;
