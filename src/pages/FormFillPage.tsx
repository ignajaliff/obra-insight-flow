
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormFill } from '@/components/forms/FormFill';
import { FormTemplate } from '@/pages/FormAdmin';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FormFillPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Obtener el usuario actual del localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;
      
      setIsLoading(true);
      try {
        // Obtener la plantilla
        const { data: templateData, error: templateError } = await supabase
          .from('form_templates')
          .select('*')
          .eq('id', templateId)
          .single();
        
        if (templateError) throw templateError;
        
        // Obtener los campos de la plantilla
        const { data: fieldData, error: fieldError } = await supabase
          .from('form_fields')
          .select('*')
          .eq('template_id', templateId)
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
        
        setTemplate({
          id: templateData.id,
          name: templateData.name,
          description: templateData.description || '',
          fields,
          created_at: templateData.created_at,
          updated_at: templateData.updated_at
        });
      } catch (error) {
        console.error('Error fetching template:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la plantilla del formulario",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplate();
  }, [templateId, toast]);

  const handleSubmitForm = async (formData: any) => {
    try {
      // Verificar si hay usuario autenticado
      if (!currentUser || !currentUser.id) {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "Debes iniciar sesión para enviar formularios",
        });
        navigate('/login');
        return;
      }
      
      // 1. Crear el registro de envío de formulario
      const { data: submission, error: submissionError } = await supabase
        .from('form_submissions')
        .insert({
          template_id: template?.id,
          user_id: currentUser.id,
          has_negative_events: formData.hasNegativeEvents,
          drive_link: formData.driveLink || null,
          review_status: 'pending'
        })
        .select()
        .single();
      
      if (submissionError) throw submissionError;
      
      // 2. Insertar los valores de los campos
      const fieldValues = Object.entries(formData.values).map(([fieldName, value]) => {
        const field = template?.fields.find(f => f.name === fieldName);
        if (!field) return null;
        
        return {
          submission_id: submission.id,
          field_id: field.id,
          value: value === null || value === undefined ? null : String(value)
        };
      }).filter(Boolean);
      
      if (fieldValues.length > 0) {
        const { error: valuesError } = await supabase
          .from('form_field_values')
          .insert(fieldValues);
        
        if (valuesError) throw valuesError;
      }
      
      toast({
        title: "Formulario enviado",
        description: "Tu formulario ha sido enviado correctamente.",
      });
      
      // Redirigir a la lista de formularios
      navigate('/formularios');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al enviar el formulario",
      });
    }
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
        userName={currentUser.name || "Usuario"}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default FormFillPage;
