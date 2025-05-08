
import { FormTemplate } from '@/types/forms';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormBasicInfoProps {
  template: FormTemplate;
  setTemplate: React.Dispatch<React.SetStateAction<FormTemplate>>;
}

export function FormBasicInfo({ template, setTemplate }: FormBasicInfoProps) {
  return (
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
    </div>
  );
}
