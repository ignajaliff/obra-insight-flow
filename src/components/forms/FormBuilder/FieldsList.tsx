
import { FormField, FormTemplate } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Trash2, Text, List, Calendar, Pen } from 'lucide-react';
import { FieldOptions } from './FieldOptions';

interface FieldsListProps {
  fields: FormField[];
  setTemplate: React.Dispatch<React.SetStateAction<FormTemplate>>;
}

export function FieldsList({ fields, setTemplate }: FieldsListProps) {
  const removeField = (fieldId: string) => {
    setTemplate(prevTemplate => ({
      ...prevTemplate,
      fields: prevTemplate.fields.filter(field => field.id !== fieldId)
    }));
  };
  
  const updateFieldProperty = (fieldId: string, property: keyof FormField, value: any) => {
    setTemplate(prevTemplate => ({
      ...prevTemplate,
      fields: prevTemplate.fields.map(field => 
        field.id === fieldId ? { ...field, [property]: value } : field
      )
    }));
  };
  
  const moveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    ) {
      return;
    }
    
    setTemplate(prevTemplate => {
      const newFields = [...prevTemplate.fields];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const field = newFields[index];
      
      newFields.splice(index, 1);
      newFields.splice(newIndex, 0, field);
      
      // Update field_order for all fields
      const updatedFields = newFields.map((field, idx) => ({
        ...field, 
        field_order: idx
      }));
      
      return {
        ...prevTemplate,
        fields: updatedFields,
      };
    });
  };
  
  const getFieldIcon = (type: FormField['type']) => {
    switch (type) {
      case 'text':
      case 'textarea':
        return <Text className="h-5 w-5" />;
      case 'select':
        return <List className="h-5 w-5" />;
      case 'date':
        return <Calendar className="h-5 w-5" />;
      case 'signature':
        return <Pen className="h-5 w-5" />;
      default:
        return <Text className="h-5 w-5" />;
    }
  };
  
  if (fields.length === 0) {
    return (
      <div className="text-center p-6 bg-muted/30 rounded-md">
        <p className="text-muted-foreground">No hay campos agregados aún. Agrega campos usando el formulario de abajo.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 mb-6">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                {getFieldIcon(field.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{field.label}</div>
                  <div className="flex items-center space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(index, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  Tipo: {field.type === 'text' ? 'Texto' : 
                         field.type === 'select' ? 'Selección' :
                         field.type === 'date' ? 'Fecha' : 
                         field.type === 'signature' ? 'Firma' : field.type}
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
                  <FieldOptions 
                    field={field}
                    updateFieldProperty={updateFieldProperty}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
