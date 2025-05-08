
import { FormTemplate } from '@/types/forms';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface FormBasicInfoProps {
  template: FormTemplate;
  setTemplate: React.Dispatch<React.SetStateAction<FormTemplate>>;
}

export function FormBasicInfo({ template, setTemplate }: FormBasicInfoProps) {
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

  return (
    <div className="space-y-6">
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
  );
}
