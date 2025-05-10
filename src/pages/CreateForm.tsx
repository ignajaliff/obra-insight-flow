import { useState } from 'react';
import { FormTemplate, FormField } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function CreateForm() {
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
    }
  });
  
  const [newFieldType, setNewFieldType] = useState<'text' | 'select' | 'date'>('text');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const updateMetadata = (key: string, value: string) => {
    const currentMetadata = template.projectMetadata || {};
    
    setTemplate({
      ...template,
      projectMetadata: {
        ...currentMetadata,
        [key]: value
      }
    });
  };
  
  const addField = () => {
    if (!newFieldLabel.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un nombre para el campo",
        variant: "destructive"
      });
      return;
    }
    
    const newField: FormField = {
      id: uuidv4(),
      name: newFieldLabel.toLowerCase().replace(/\s+/g, '_'),
      label: newFieldLabel,
      type: newFieldType,
      required: false,
      field_order: template.fields.length,
      options: newFieldType === 'select' ? ['Opción 1', 'Opción 2'] : undefined
    };
    
    setTemplate({
      ...template,
      fields: [...template.fields, newField],
    });
    
    setNewFieldLabel('');
  };
  
  const removeField = (fieldId: string) => {
    setTemplate({
      ...template,
      fields: template.fields.filter(field => field.id !== fieldId)
    });
  };
  
  const updateFieldProperty = (fieldId: string, property: keyof FormField, value: any) => {
    setTemplate({
      ...template,
      fields: template.fields.map(field => 
        field.id === fieldId ? { ...field, [property]: value } : field
      )
    });
  };
  
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
      
      // Save to Supabase
      const { error } = await supabase
        .from('form_templates')
        .insert(templateToSave);
      
      if (error) {
        throw error;
      }
      
      // También guardar en localStorage como respaldo
      const existingTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
      localStorage.setItem('formTemplates', JSON.stringify([...existingTemplates, templateToSave]));
      
      toast({
        title: "Formulario guardado",
        description: "Tu formulario ha sido guardado correctamente."
      });
      
      // Navigate to the forms list
      navigate(`/formularios/mis-formularios`);
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el formulario. Inténtalo de nuevo.",
        variant: "destructive"
      });
      
      // Intentar guardar solo en localStorage como fallback
      try {
        const templateToSave = {
          ...template,
          public_url: `/formularios/rellenar/${template.id}`,
          updated_at: new Date().toISOString()
        };
        
        const existingTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        localStorage.setItem('formTemplates', JSON.stringify([...existingTemplates, templateToSave]));
        
        toast({
          title: "Formulario guardado localmente",
          description: "Tu formulario ha sido guardado en este dispositivo."
        });
        
        navigate(`/formularios/mis-formularios`);
      } catch {
        // Si todo falla, no hacer nada más
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/formularios/mis-formularios">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Crear nuevo formulario</h1>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="form-name">Nombre del formulario</Label>
          <Input
            id="form-name"
            value={template.name}
            onChange={e => setTemplate({ ...template, name: e.target.value })}
            placeholder="Ej. Inspección de seguridad"
          />
        </div>
        
        <Card className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información del Proyecto</h3>
            <p className="text-sm text-muted-foreground">
              Esta información se adjuntará al formulario pero no será visible para quienes lo completen.
            </p>
            
            <div>
              <Label htmlFor="metadata-projectName">Nombre proyecto</Label>
              <Input
                id="metadata-projectName"
                value={template.projectMetadata?.projectName || ''}
                onChange={e => updateMetadata('projectName', e.target.value)}
                placeholder="Ingresa el nombre del proyecto"
              />
            </div>

            <div>
              <Label htmlFor="metadata-companyName">Razón Social</Label>
              <Input
                id="metadata-companyName"
                value={template.projectMetadata?.companyName || ''}
                onChange={e => updateMetadata('companyName', e.target.value)}
                placeholder="Ingresa la razón social"
              />
            </div>

            <div>
              <Label htmlFor="metadata-location">Lugar</Label>
              <Input
                id="metadata-location"
                value={template.projectMetadata?.location || ''}
                onChange={e => updateMetadata('location', e.target.value)}
                placeholder="Ingresa la ubicación"
              />
            </div>
          </div>
        </Card>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="font-medium text-lg mb-4">Campos del formulario</h3>
        
        {template.fields.length === 0 ? (
          <div className="text-center p-6 bg-muted/30 rounded-md">
            <p className="text-muted-foreground">No hay campos agregados aún. Agrega campos usando el formulario de abajo.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {template.fields.map((field) => (
              <Card key={field.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{field.label}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeField(field.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  Tipo: {field.type === 'text' ? 'Texto' : 
                         field.type === 'select' ? 'Selección' :
                         field.type === 'date' ? 'Fecha' : field.type}
                </div>
                
                <div className="flex items-center mb-2">
                  <input 
                    type="checkbox" 
                    id={`required-${field.id}`}
                    checked={field.required}
                    onChange={e => updateFieldProperty(field.id, 'required', e.target.checked)}
                    className="mr-2"
                  />
                  <Label htmlFor={`required-${field.id}`} className="text-sm">Campo obligatorio</Label>
                </div>
                
                {field.type === 'select' && field.options && (
                  <div className="mt-2">
                    <Label>Opciones</Label>
                    <div className="space-y-2">
                      {field.options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <Input 
                            value={option} 
                            onChange={e => {
                              const newOptions = [...(field.options || [])];
                              newOptions[idx] = e.target.value;
                              updateFieldProperty(field.id, 'options', newOptions);
                            }}
                            placeholder={`Opción ${idx + 1}`}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const newOptions = (field.options || []).filter((_, i) => i !== idx);
                              updateFieldProperty(field.id, 'options', newOptions);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newOptions = [...(field.options || []), `Opción ${(field.options?.length || 0) + 1}`];
                          updateFieldProperty(field.id, 'options', newOptions);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Agregar opción
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
        
        <div className="border rounded-md p-4 mt-6">
          <h4 className="font-medium mb-3">Agregar nuevo campo</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="field-type">Tipo de campo</Label>
              <Select
                value={newFieldType}
                onValueChange={(value: 'text' | 'select' | 'date') => setNewFieldType(value)}
              >
                <SelectTrigger id="field-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="select">Selección</SelectItem>
                  <SelectItem value="date">Fecha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="field-label">Nombre del campo</Label>
              <Input 
                id="field-label" 
                value={newFieldLabel}
                onChange={e => setNewFieldLabel(e.target.value)}
                placeholder="Ej. Estado del equipo"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                type="button" 
                className="w-full" 
                onClick={addField}
                disabled={!newFieldLabel.trim()}
              >
                <Plus className="h-4 w-4 mr-2" /> Agregar campo
              </Button>
            </div>
          </div>
        </div>
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
