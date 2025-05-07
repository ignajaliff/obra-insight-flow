
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormField, FormTemplate } from '@/pages/FormAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

// Componente simulado FormFill para evitar errores
const FormFill: React.FC<{
  template: FormTemplate;
  onComplete: () => void;
}> = ({ template, onComplete }) => {
  return (
    <div className="space-y-4">
      <p>Formulario: {template.name}</p>
      <p>Este es un formulario simulado.</p>
      <Button onClick={onComplete}>Completar formulario</Button>
    </div>
  );
};

const FormFillPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        
        // Simulación de carga de plantilla
        // En un caso real, cargaríamos la plantilla desde la base de datos
        setTimeout(() => {
          setTemplate({
            id: templateId || '1',
            name: 'Formulario de Inspección',
            description: 'Formulario para inspección diaria',
            fields: [
              {
                id: '1',
                name: 'worker_name',
                label: 'Nombre del Trabajador',
                type: 'text',
                required: true,
                field_order: 0
              },
              {
                id: '2',
                name: 'proyecto',
                label: 'Proyecto',
                type: 'text',
                required: true,
                field_order: 1
              },
              {
                id: '3',
                name: 'date',
                label: 'Fecha',
                type: 'date',
                required: true,
                field_order: 2
              }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error('Error fetching template:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la plantilla del formulario"
        });
        setLoading(false);
      }
    };
    
    fetchTemplate();
  }, [templateId, toast]);

  const handleFormComplete = async () => {
    try {
      toast({
        title: "Formulario enviado",
        description: "El formulario ha sido completado y enviado correctamente."
      });
      navigate('/formularios');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el formulario"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">
          {loading ? 'Cargando formulario...' : template?.name}
        </h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : template ? (
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="form">
              <TabsList className="mb-4">
                <TabsTrigger value="form">Formulario</TabsTrigger>
                <TabsTrigger value="info">Información</TabsTrigger>
              </TabsList>
              
              <TabsContent value="form">
                <FormFill 
                  template={template}
                  onComplete={handleFormComplete} 
                />
              </TabsContent>
              
              <TabsContent value="info">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Descripción</h3>
                    <p className="text-gray-600">{template.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Campos del formulario</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {template.fields.map((field) => (
                        <li key={field.id}>
                          <span className="font-medium">{field.label}</span>
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                          <span className="text-gray-500 ml-2">({field.type})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No se encontró el formulario solicitado</p>
          <Button onClick={() => navigate('/formularios/disponibles')} className="mt-4">
            Ver formularios disponibles
          </Button>
        </div>
      )}
    </div>
  );
};

export default FormFillPage;
