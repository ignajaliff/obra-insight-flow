
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Save, X, Edit, Trash2 } from 'lucide-react';
import { FormTemplateEditor } from '@/components/forms/FormTemplateEditor';
import { FormTemplateList } from '@/components/forms/FormTemplateList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormTemplate, FormField } from '@/types/forms';

// Tipos de formularios predefinidos
export type FieldType = 'text' | 'number' | 'checkbox' | 'select' | 'date' | 'textarea';

const FormAdmin = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<string>('list');
  const [currentTemplate, setCurrentTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Cargar plantillas de formularios desde Supabase
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
            type: field.field_type as FieldType,
            required: field.required || false,
            options: field.options,
            isNegativeIndicator: field.is_negative_indicator || false,
            field_order: field.field_order
          }));
          
          return {
            id: template.id,
            name: template.name,
            description: template.description || '',
            company_id: template.company_id,
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

  const handleCreateNew = () => {
    const newTemplate: FormTemplate = {
      id: `template-${Date.now()}`, // ID temporal, se reemplazará al guardar
      name: 'Nuevo Formulario',
      description: 'Descripción del nuevo formulario',
      fields: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCurrentTemplate(newTemplate);
    setActiveTab('edit');
  };

  const handleEdit = (template: FormTemplate) => {
    setCurrentTemplate({ ...template });
    setActiveTab('edit');
  };

  const handleSave = async (template: FormTemplate) => {
    try {
      const now = new Date().toISOString();
      const isExisting = templates.some((t) => t.id === template.id && !template.id.startsWith('template-'));
      
      // Actualizar o crear plantilla
      let templateId = template.id;
      
      if (isExisting) {
        // Actualizar plantilla existente
        const { error: templateError } = await supabase
          .from('form_templates')
          .update({
            name: template.name,
            description: template.description,
            updated_at: now
          })
          .eq('id', template.id);
        
        if (templateError) throw templateError;
      } else {
        // Crear nueva plantilla
        const { data: newTemplate, error: templateError } = await supabase
          .from('form_templates')
          .insert({
            name: template.name,
            description: template.description,
            created_at: now,
            updated_at: now
          })
          .select()
          .single();
        
        if (templateError) throw templateError;
        templateId = newTemplate.id;
      }
      
      // Si es una plantilla existente, eliminar campos antiguos
      if (isExisting) {
        const { error: deleteError } = await supabase
          .from('form_fields')
          .delete()
          .eq('template_id', templateId);
        
        if (deleteError) throw deleteError;
      }
      
      // Insertar campos nuevos
      if (template.fields.length > 0) {
        const fieldsToInsert = template.fields.map((field, index) => ({
          template_id: templateId,
          name: field.name,
          label: field.label,
          field_type: field.type,
          required: field.required,
          is_negative_indicator: field.isNegativeIndicator || false,
          options: field.options || [],
          field_order: index // Usar índice para ordenar campos
        }));
        
        const { error: fieldsError } = await supabase
          .from('form_fields')
          .insert(fieldsToInsert);
        
        if (fieldsError) throw fieldsError;
      }
      
      // Recargar plantillas
      const { data: updatedTemplate, error: fetchError } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', templateId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const { data: updatedFields, error: fetchFieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('template_id', templateId)
        .order('field_order', { ascending: true });
        
      if (fetchFieldsError) throw fetchFieldsError;
      
      const formattedFields = updatedFields.map(field => ({
        id: field.id,
        name: field.name,
        label: field.label,
        type: field.field_type as FieldType,
        required: field.required || false,
        options: field.options,
        isNegativeIndicator: field.is_negative_indicator || false,
        field_order: field.field_order
      }));
      
      const completeTemplate = {
        id: updatedTemplate.id,
        name: updatedTemplate.name,
        description: updatedTemplate.description || '',
        company_id: updatedTemplate.company_id,
        fields: formattedFields,
        created_at: updatedTemplate.created_at,
        updated_at: updatedTemplate.updated_at
      };
      
      // Actualizar estado
      if (isExisting) {
        setTemplates(templates.map(t => t.id === templateId ? completeTemplate : t));
      } else {
        setTemplates([completeTemplate, ...templates]);
      }
      
      toast({
        title: isExisting ? "Formulario actualizado" : "Formulario creado",
        description: `El formulario "${template.name}" ha sido ${isExisting ? 'actualizado' : 'creado'} correctamente`,
      });
      
      setActiveTab('list');
      setCurrentTemplate(null);
      
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la plantilla de formulario",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Eliminar plantilla (las claves foráneas se encargarán de los campos)
      const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Actualizar estado
      setTemplates(templates.filter((t) => t.id !== id));
      
      if (currentTemplate?.id === id) {
        setCurrentTemplate(null);
        setActiveTab('list');
      }
      
      toast({
        title: "Formulario eliminado",
        description: "La plantilla de formulario ha sido eliminada correctamente",
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la plantilla de formulario",
      });
    }
  };

  const handleCancel = () => {
    setCurrentTemplate(null);
    setActiveTab('list');
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Administración de Formularios</h1>
          <p className="text-muted-foreground">
            Crea y gestiona formularios predefinidos para tu equipo
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <PlusCircle size={16} />
          Crear Formulario
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Formularios</TabsTrigger>
          <TabsTrigger value="edit" disabled={!currentTemplate}>
            {currentTemplate ? 'Editar Formulario' : 'Nuevo Formulario'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <FormTemplateList
              templates={templates}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          {currentTemplate && (
            <FormTemplateEditor
              template={currentTemplate}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormAdmin;
