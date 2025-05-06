
import { useState } from 'react';
import { FormField, FormTemplate } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface AddFieldSectionProps {
  template: FormTemplate;
  setTemplate: React.Dispatch<React.SetStateAction<FormTemplate>>;
}

export function AddFieldSection({ template, setTemplate }: AddFieldSectionProps) {
  const { toast } = useToast();
  const [newFieldType, setNewFieldType] = useState<FormField['type']>('text');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  
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
  
  return (
    <div className="border rounded-md p-4 mt-6">
      <h4 className="font-medium mb-3">Agregar nuevo campo</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="field-type">Tipo de campo</Label>
          <Select
            value={newFieldType}
            onValueChange={(value: FormField['type']) => setNewFieldType(value)}
          >
            <SelectTrigger id="field-type">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="textarea">Área de texto</SelectItem>
              <SelectItem value="select">Selección</SelectItem>
              <SelectItem value="date">Fecha</SelectItem>
              <SelectItem value="signature">Firma</SelectItem>
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
  );
}
