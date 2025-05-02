
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormFill } from '@/components/forms/FormFill';
import { FormTemplate } from '@/pages/FormAdmin';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// En un proyecto real, estos datos vendrían de la base de datos
const mockTemplates: FormTemplate[] = [
  {
    id: '1',
    name: 'Checklist de Seguridad',
    description: 'Formulario para verificar condiciones de seguridad en obra',
    fields: [
      {
        id: 'field1',
        name: 'area',
        label: 'Área de trabajo',
        type: 'text',
        required: true,
      },
      {
        id: 'field2',
        name: 'equipoSeguridad',
        label: '¿Todos los trabajadores usan equipo de seguridad?',
        type: 'checkbox',
        required: true,
        isNegativeIndicator: true,
      },
      {
        id: 'field3',
        name: 'riesgosIdentificados',
        label: 'Riesgos identificados',
        type: 'textarea',
        required: false,
        isNegativeIndicator: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Informe Diario de Obra',
    description: 'Registro diario de avances y actividades en obra',
    fields: [
      {
        id: 'field1',
        name: 'proyecto',
        label: 'Proyecto',
        type: 'text',
        required: true,
      },
      {
        id: 'field2',
        name: 'fecha',
        label: 'Fecha',
        type: 'date',
        required: true,
      },
      {
        id: 'field3',
        name: 'avance',
        label: 'Porcentaje de avance',
        type: 'number',
        required: true,
      },
      {
        id: 'field4',
        name: 'problemas',
        label: 'Problemas encontrados',
        type: 'textarea',
        required: false,
        isNegativeIndicator: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Simulación de un usuario actual (en un proyecto real usaríamos autenticación)
const currentUser = {
  id: '1',
  name: 'Juan Pérez',
  role: 'supervisor',
};

const FormFillPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulación de carga de datos
    setTimeout(() => {
      const foundTemplate = mockTemplates.find(t => t.id === templateId);
      setTemplate(foundTemplate || null);
      setIsLoading(false);
    }, 500);
  }, [templateId]);

  const handleSubmitForm = (formData: any) => {
    console.log('Form submitted:', formData);
    
    // En un proyecto real, aquí guardaríamos los datos en la base de datos
    
    toast({
      title: "Formulario enviado",
      description: "Tu formulario ha sido enviado correctamente.",
    });
    
    // Redirigir a la lista de formularios o dashboard
    // En un proyecto real, podrías usar useNavigate para redirigir
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container py-6">
        <div className="text-center p-6 space-y-4">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Formulario no encontrado</h2>
          <p className="text-muted-foreground">
            El formulario que estás buscando no existe o ha sido eliminado.
          </p>
          <Button asChild className="mt-4">
            <a href="/formularios">Volver a formularios</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-6">
      <FormFill
        template={template}
        userName={currentUser.name}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default FormFillPage;
