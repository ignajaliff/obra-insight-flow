
import { FormField } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';

interface FieldOptionsProps {
  field: FormField;
  updateFieldProperty: (fieldId: string, property: keyof FormField, value: any) => void;
}

export function FieldOptions({ field, updateFieldProperty }: FieldOptionsProps) {
  return (
    <div className="mt-2">
      <Label>Opciones</Label>
      <div className="space-y-2">
        {field.options?.map((option, idx) => (
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
  );
}
