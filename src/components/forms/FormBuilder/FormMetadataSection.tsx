
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ProjectMetadata, FormTemplate } from '@/types/forms';

interface FormMetadataSectionProps {
  template: FormTemplate;
  setTemplate: React.Dispatch<React.SetStateAction<FormTemplate>>;
}

export function FormMetadataSection({ template, setTemplate }: FormMetadataSectionProps) {
  const [newMetadataKey, setNewMetadataKey] = useState('');
  
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
  
  const addCustomField = () => {
    if (!newMetadataKey.trim()) return;
    
    const safeKey = newMetadataKey.toLowerCase().replace(/\s+/g, '_');
    updateMetadata(safeKey, '');
    setNewMetadataKey('');
  };
  
  const removeCustomField = (key: string) => {
    if (!template.projectMetadata) return;
    
    const newMetadata = { ...template.projectMetadata };
    delete newMetadata[key];
    
    setTemplate({
      ...template,
      projectMetadata: newMetadata
    });
  };
  
  const predefinedFields = [
    { key: 'projectName', label: 'Nombre del Proyecto' },
    { key: 'location', label: 'Ubicación' },
    { key: 'supervisor', label: 'Supervisor' },
    { key: 'notes', label: 'Notas Adicionales' }
  ];
  
  const customFields = template.projectMetadata 
    ? Object.keys(template.projectMetadata)
      .filter(key => !predefinedFields.some(field => field.key === key))
      .map(key => ({ key, value: template.projectMetadata?.[key] || '' }))
    : [];
  
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <h3 className="text-lg font-medium">Información del Proyecto (Solo visible para administradores)</h3>
        <p className="text-sm text-muted-foreground">
          Esta información se adjuntará al formulario cuando se envíe, pero no será visible para quienes lo completen.
        </p>
        
        <div className="space-y-4">
          {predefinedFields.map(field => (
            <div key={field.key}>
              <Label htmlFor={`metadata-${field.key}`}>{field.label}</Label>
              {field.key === 'notes' ? (
                <Textarea
                  id={`metadata-${field.key}`}
                  value={template.projectMetadata?.[field.key] || ''}
                  onChange={e => updateMetadata(field.key, e.target.value)}
                  placeholder={`Ingresa ${field.label.toLowerCase()}`}
                  rows={3}
                />
              ) : (
                <Input
                  id={`metadata-${field.key}`}
                  value={template.projectMetadata?.[field.key] || ''}
                  onChange={e => updateMetadata(field.key, e.target.value)}
                  placeholder={`Ingresa ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>
        
        {customFields.length > 0 && (
          <div className="space-y-3 border-t pt-3">
            <h4 className="font-medium">Campos personalizados</h4>
            {customFields.map(field => (
              <div key={field.key} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Label htmlFor={`custom-${field.key}`}>
                    {field.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </Label>
                  <Input
                    id={`custom-${field.key}`}
                    value={field.value}
                    onChange={e => updateMetadata(field.key, e.target.value)}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="mt-6" 
                  onClick={() => removeCustomField(field.key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="border-t pt-3">
          <h4 className="font-medium mb-2">Añadir campo personalizado</h4>
          <div className="flex gap-2">
            <Input
              value={newMetadataKey}
              onChange={e => setNewMetadataKey(e.target.value)}
              placeholder="Nombre del campo"
            />
            <Button type="button" onClick={addCustomField} disabled={!newMetadataKey.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Añadir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
