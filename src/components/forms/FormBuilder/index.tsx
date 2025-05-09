
import { useState, useEffect } from 'react';
import { FormTemplate } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FormBasicInfo } from './FormBasicInfo';
import { FieldsList } from './FieldsList';
import { AddFieldSection } from './AddFieldSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

interface FormBuilderProps {
  onFormCreated?: () => void;
  initialTemplate?: FormTemplate;
}

export function FormBuilder({ onFormCreated, initialTemplate }: FormBuilderProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<FormTemplate>(
    initialTemplate || {
      id: uuidv4(),
      name: '',
      fields: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      projectMetadata: {
        projectName: '',
        companyName: '',
        location: ''
      },
    }
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  const [formSaved, setFormSaved] = useState(false);
  
  // Use effect to update form if initialTemplate changes
  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);
  
  const saveTemplate = async () => {
    // Validate form
    if (!template.name.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un nombre para el formulario",
        variant: "destructive"
      });
      return;
    }
    
    if (template.fields.length === 0) {
      toast({
        title: "Campos requeridos",
        description: "Por favor agrega al menos un campo al formulario",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Generate a public URL for the form
      const publicUrl = `/formularios/rellenar/${template.id}`;
      
      console.log("Guardando formulario en Supabase:", template);
      
      // Check if we're updating an existing template or creating a new one
      const isUpdate = initialTemplate !== undefined;
      
      if (isUpdate) {
        // Update existing template
        const { error } = await supabase
          .from('form_templates')
          .update({
            name: template.name,
            description: template.description || null,
            fields: template.fields as unknown as Json,
            public_url: publicUrl,
            is_active: true,
            projectmetadata: template.projectMetadata as unknown as Json,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id);
        
        if (error) {
          console.error("Error actualizando en Supabase:", error);
          toast({
            title: "Error",
            description: "No se pudo actualizar el formulario. Error: " + error.message,
            variant: "destructive"
          });
          setIsSaving(false);
          return;
        }
        
        console.log("Formulario actualizado exitosamente en Supabase");
      } else {
        // Insert new template
        const { error } = await supabase
          .from('form_templates')
          .insert({
            id: template.id,
            name: template.name,
            description: template.description || null,
            fields: template.fields as unknown as Json,
            public_url: publicUrl,
            is_active: true,
            projectmetadata: template.projectMetadata as unknown as Json
          });
        
        if (error) {
          console.error("Error guardando en Supabase:", error);
          toast({
            title: "Error",
            description: "No se pudo guardar el formulario. Error: " + error.message,
            variant: "destructive"
          });
          setIsSaving(false);
          return;
        }
        
        console.log("Formulario guardado exitosamente en Supabase");
      }
      
      setFormSaved(true);
      
      toast({
        title: isUpdate ? "Formulario actualizado" : "Formulario guardado",
        description: isUpdate ? 
          "Tu formulario ha sido actualizado correctamente." : 
          "Tu formulario ha sido guardado correctamente."
      });
      
      // If callback provided, call it
      if (onFormCreated) {
        onFormCreated();
      }
      
    } catch (error) {
      console.error("Error guardando formulario:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el formulario. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Function to handle navigation back to forms list
  const goToFormsList = () => {
    navigate('/formularios');
  };
  
  return (
    <div className="space-y-6">
      <FormBasicInfo 
        template={template}
        setTemplate={setTemplate}
      />
      
      <div className="border-t pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="fields">Campos del formulario</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fields" className="space-y-6">
            <FieldsList 
              fields={template.fields}
              setTemplate={setTemplate}
            />
            
            <AddFieldSection 
              template={template}
              setTemplate={setTemplate}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="border-t pt-6 flex justify-end">
        {formSaved ? (
          <div className="w-full flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Formulario guardado correctamente.</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
                const url = `/formularios/rellenar/${template.id}`;
                navigator.clipboard.writeText(`${window.location.origin}${url}`);
                toast({
                  title: "Enlace copiado",
                  description: "El enlace del formulario ha sido copiado al portapapeles."
                });
              }}>
                Copiar enlace
              </Button>
              <Button onClick={onFormCreated || goToFormsList}>
                Ver mis formularios
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={saveTemplate}
            disabled={isSaving || template.name.trim() === '' || template.fields.length === 0}
          >
            {isSaving ? "Guardando..." : initialTemplate ? "Actualizar formulario" : "Guardar formulario"}
          </Button>
        )}
      </div>
    </div>
  );
}
