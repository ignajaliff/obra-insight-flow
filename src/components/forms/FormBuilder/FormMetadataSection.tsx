
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormTemplate } from '@/types/forms';

interface FormMetadataSectionProps {
  template: FormTemplate;
  setTemplate: React.Dispatch<React.SetStateAction<FormTemplate>>;
}

export function FormMetadataSection({ template, setTemplate }: FormMetadataSectionProps) {
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
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-medium">Información del Proyecto (Solo visible para administradores)</h3>
        <p className="text-sm text-muted-foreground">
          Esta información se adjuntará al formulario cuando se envíe, pero no será visible para quienes lo completen.
        </p>
        
        <div className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
