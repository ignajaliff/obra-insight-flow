
import { useState } from 'react';
import { FormTemplate } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FormBasicInfo } from './FormBasicInfo';
import { FieldsList } from './FieldsList';
import { AddFieldSection } from './AddFieldSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function FormBuilder() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<FormTemplate>({
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
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  
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
      const templateToSave = {
        ...template,
        public_url: publicUrl,
        updated_at: new Date().toISOString()
      };
      
      // Save to localStorage for now (would be to Supabase in production)
      const existingTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
      localStorage.setItem('formTemplates', JSON.stringify([...existingTemplates, templateToSave]));
      
      toast({
        title: "Formulario guardado",
        description: "Tu formulario ha sido guardado correctamente."
      });
      
      // Navigate to the form view page
      navigate(`/formularios/ver/${template.id}`);
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el formulario. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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
        <Button 
          onClick={saveTemplate}
          disabled={isSaving || template.name.trim() === '' || template.fields.length === 0}
        >
          Guardar formulario
        </Button>
      </div>
    </div>
  );
}
