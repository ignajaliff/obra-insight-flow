
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormTemplate, FieldType } from '@/types/forms';
import { PlusCircle, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface FormTemplateEditorProps {
  template: FormTemplate;
  onSave: (template: FormTemplate) => void;
  onCancel: () => void;
}

export function FormTemplateEditor({ template, onSave, onCancel }: FormTemplateEditorProps) {
  const [editableTemplate, setEditableTemplate] = useState<FormTemplate>({ ...template });
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTemplate({ ...editableTemplate, name: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableTemplate({ ...editableTemplate, description: e.target.value });
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) return;

    // Calculate the next field_order value
    const nextOrder = editableTemplate.fields.length > 0 
      ? Math.max(...editableTemplate.fields.map(f => f.field_order)) + 1 
      : 0;

    const newField: FormField = {
      id: `field-${Date.now()}`,
      name: newFieldName.toLowerCase().replace(/\s+/g, '_'),
      label: newFieldName,
      type: newFieldType,
      required: false,
      options: newFieldType === 'select' ? ['Opción 1', 'Opción 2'] : undefined,
      isNegativeIndicator: false,
      field_order: nextOrder, // Add the field_order property
    };

    setEditableTemplate({
      ...editableTemplate,
      fields: [...editableTemplate.fields, newField],
    });

    setNewFieldName('');
    setNewFieldType('text');
  };

  const handleDeleteField = (id: string) => {
    setEditableTemplate({
      ...editableTemplate,
      fields: editableTemplate.fields.filter((field) => field.id !== id),
    });
  };

  const handleFieldChange = (id: string, key: keyof FormField, value: any) => {
    setEditableTemplate({
      ...editableTemplate,
      fields: editableTemplate.fields.map((field) => {
        if (field.id === id) {
          return { ...field, [key]: value };
        }
        return field;
      }),
    });
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === editableTemplate.fields.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const fields = [...editableTemplate.fields];
    const field = fields[index];
    fields.splice(index, 1);
    fields.splice(newIndex, 0, field);

    setEditableTemplate({
      ...editableTemplate,
      fields,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editableTemplate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 mb-6">
        <div>
          <Label htmlFor="name">Nombre del formulario</Label>
          <Input
            id="name"
            value={editableTemplate.name}
            onChange={handleNameChange}
            placeholder="Ej: Checklist de Seguridad"
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={editableTemplate.description}
            onChange={handleDescriptionChange}
            placeholder="Describe el propósito de este formulario"
            rows={3}
          />
        </div>
      </div>

      <div className="border rounded-md p-4 space-y-4">
        <h3 className="font-medium">Campos del formulario</h3>
        
        {editableTemplate.fields.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No hay campos definidos. Agrega campos a tu formulario.
          </p>
        )}

        {editableTemplate.fields.map((field, index) => (
          <div key={field.id} className="border rounded-md p-4 grid gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant={field.isNegativeIndicator ? "destructive" : "secondary"}>
                  {field.type}
                </Badge>
                <h4 className="font-medium">{field.label}</h4>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveField(index, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp size={16} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoveField(index, 'down')}
                  disabled={index === editableTemplate.fields.length - 1}
                >
                  <ArrowDown size={16} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteField(field.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`field-label-${field.id}`}>Etiqueta</Label>
                <Input
                  id={`field-label-${field.id}`}
                  value={field.label}
                  onChange={(e) => handleFieldChange(field.id, 'label', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`field-name-${field.id}`}>Nombre interno</Label>
                <Input
                  id={`field-name-${field.id}`}
                  value={field.name}
                  onChange={(e) => 
                    handleFieldChange(
                      field.id, 
                      'name', 
                      e.target.value.toLowerCase().replace(/\s+/g, '_')
                    )
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id={`field-required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(checked) => handleFieldChange(field.id, 'required', checked)}
                />
                <Label htmlFor={`field-required-${field.id}`}>Campo obligatorio</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  id={`field-negative-${field.id}`}
                  checked={field.isNegativeIndicator}
                  onCheckedChange={(checked) => 
                    handleFieldChange(field.id, 'isNegativeIndicator', checked)
                  }
                />
                <Label htmlFor={`field-negative-${field.id}`}>Indicador negativo</Label>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-4 pt-4 border-t">
          <h4 className="text-sm font-medium">Añadir nuevo campo</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="col-span-1 md:col-span-1">
              <Select
                value={newFieldType}
                onValueChange={(value) => setNewFieldType(value as FieldType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="select">Desplegable</SelectItem>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="textarea">Área de texto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 md:col-span-1">
              <Input
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Nombre del campo"
              />
            </div>
            <div className="col-span-1 md:col-span-1">
              <Button
                type="button"
                onClick={handleAddField}
                className="w-full"
                disabled={!newFieldName.trim()}
              >
                <PlusCircle size={16} className="mr-2" />
                Añadir Campo
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          <Save size={16} className="mr-2" />
          Guardar Formulario
        </Button>
      </div>
    </form>
  );
}
