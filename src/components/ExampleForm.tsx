
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FormTemplate, FieldType } from '@/types/forms';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export const createExampleForm = async () => {
  const formId = uuidv4();
  
  const exampleForm: FormTemplate = {
    id: formId,
    name: 'Inspección de Seguridad',
    description: 'Formulario de ejemplo para inspecciones de seguridad',
    fields: [
      {
        id: uuidv4(),
        name: 'nombre_trabajador',
        label: 'Nombre del trabajador',
        type: 'text' as FieldType,
        required: true,
        field_order: 0
      },
      {
        id: uuidv4(),
        name: 'area_trabajo',
        label: 'Área de trabajo',
        type: 'select' as FieldType,
        required: true,
        options: ['Construcción', 'Electricidad', 'Plomería', 'Soldadura', 'Otro'],
        field_order: 1
      },
      {
        id: uuidv4(),
        name: 'equipo_proteccion',
        label: '¿Cuenta con equipo de protección personal?',
        type: 'checkbox' as FieldType,
        required: true,
        field_order: 2
      },
      {
        id: uuidv4(),
        name: 'observaciones',
        label: 'Observaciones',
        type: 'textarea' as FieldType,
        required: false,
        field_order: 3
      },
      {
        id: uuidv4(),
        name: 'fecha_inspeccion',
        label: 'Fecha de inspección',
        type: 'date' as FieldType,
        required: true,
        field_order: 4
      },
      {
        id: uuidv4(),
        name: 'firma_supervisor',
        label: 'Firma del supervisor',
        type: 'signature' as FieldType,
        required: true,
        field_order: 5
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    public_url: `/formularios/rellenar/${formId}`,
    is_active: true,
    projectMetadata: {
      projectName: 'Proyecto Ejemplo',
      companyName: 'Constructora ABC',
      location: 'Ciudad de México'
    }
  };
  
  try {
    // Save the form to Supabase
    const { error } = await supabase
      .from('form_templates')
      .insert({
        id: exampleForm.id,
        name: exampleForm.name,
        description: exampleForm.description,
        fields: exampleForm.fields,
        public_url: exampleForm.public_url,
        is_active: exampleForm.is_active,
        projectmetadata: exampleForm.projectMetadata,
        created_at: exampleForm.created_at,
        updated_at: exampleForm.updated_at
      });
    
    if (error) {
      console.error("Error creating example form:", error);
      return null;
    }
    
    console.log("Example form created successfully");
    return exampleForm;
  } catch (error) {
    console.error("Exception creating example form:", error);
    return null;
  }
};

export const ExampleFormButton = () => {
  const { toast } = useToast();
  
  const handleCreateExampleForm = async () => {
    try {
      const form = await createExampleForm();
      if (form) {
        toast({
          title: "Formulario de ejemplo creado",
          description: "Se ha creado un formulario de ejemplo para que puedas probarlo."
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el formulario de ejemplo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error creating example form:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el formulario de ejemplo.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Button onClick={handleCreateExampleForm}>
      Crear formulario de ejemplo
    </Button>
  );
};

export const CreateExampleFormOnLoad = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAndCreateExampleForm = async () => {
      try {
        // Check if there are already forms
        const { data, error } = await supabase
          .from('form_templates')
          .select('id')
          .limit(1);
        
        if (error) {
          console.error("Error checking existing forms:", error);
          return;
        }
        
        // If there are no forms, create an example
        if (!data || data.length === 0) {
          console.log("No forms found, creating example form");
          const form = await createExampleForm();
          if (form) {
            toast({
              title: "Formulario de ejemplo creado",
              description: "Se ha creado un formulario de ejemplo para que puedas empezar a trabajar."
            });
          }
        }
      } catch (error) {
        console.error("Error in checkAndCreateExampleForm:", error);
      }
    };
    
    checkAndCreateExampleForm();
  }, [toast]);
  
  return null;
};
