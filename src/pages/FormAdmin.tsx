
import React, { useState, useEffect } from 'react';
import { FormTemplate, FormField } from '@/types/forms';
import { FormTemplateList } from '@/components/forms/FormTemplateList';
import { FormTemplateEditor } from '@/components/forms/FormTemplateEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

// Exportar interfaces para ser utilizadas en otros componentes
export type { FormTemplate, FormField };

const FormAdmin = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // Aquí estaría la lógica de obtención de datos si estuviéramos usando las tablas form_templates
      // Como hemos eliminado esa tabla, usamos datos ficticios para que no falle la aplicación
      setTemplates([
        {
          id: '1',
          name: 'Inspección de Seguridad',
          description: 'Formulario para inspección diaria de seguridad',
          fields: [
            {
              id: '1',
              name: 'nombre_trabajador',
              label: 'Nombre del Trabajador',
              type: 'text',
              required: true,
              field_order: 0
            },
            {
              id: '2',
              name: 'empresa',
              label: 'Empresa',
              type: 'text',
              required: true,
              field_order: 1
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar las plantillas de formularios"
      });
    }
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate({
      id: '',
      name: '',
      description: '',
      fields: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEditTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSaveTemplate = async (template: FormTemplate) => {
    try {
      let updatedTemplates;
      
      if (isCreating) {
        // Simular la creación de una nueva plantilla
        const newTemplate = {
          ...template,
          id: Date.now().toString(), // Generar un ID único
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        updatedTemplates = [...templates, newTemplate];
        toast({
          title: "Plantilla creada",
          description: `La plantilla ${template.name} ha sido creada correctamente`
        });
      } else {
        // Simular la actualización de una plantilla existente
        updatedTemplates = templates.map(t => 
          t.id === template.id ? {...template, updated_at: new Date().toISOString()} : t
        );
        toast({
          title: "Plantilla actualizada",
          description: `La plantilla ${template.name} ha sido actualizada correctamente`
        });
      }
      
      setTemplates(updatedTemplates);
      setSelectedTemplate(null);
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la plantilla de formulario"
      });
    }
  };

  const handleCancelEdit = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      // Simulación de eliminación
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      setTemplates(updatedTemplates);
      
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla ha sido eliminada correctamente"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la plantilla de formulario"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Administración de Formularios</h1>
          <p className="text-muted-foreground">Crea y gestiona plantillas de formularios</p>
        </div>
        <Button onClick={handleCreateTemplate} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </Button>
      </div>
      
      <div className="grid md:grid-cols-12 gap-6">
        <div className={`md:col-span-${isEditing || isCreating ? '4' : '12'}`}>
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Plantillas disponibles</h2>
              <FormTemplateList
                templates={templates}
                onSelect={handleEditTemplate}
                onDelete={handleDeleteTemplate}
              />
            </CardContent>
          </Card>
        </div>
        
        {(isEditing || isCreating) && selectedTemplate && (
          <div className="md:col-span-8">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-semibold mb-4">
                  {isCreating ? 'Nueva Plantilla' : 'Editar Plantilla'}
                </h2>
                <FormTemplateEditor
                  template={selectedTemplate}
                  onSave={handleSaveTemplate}
                  onCancel={handleCancelEdit}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormAdmin;
