
import React from 'react';
import { FormTemplate } from '@/types/forms';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface ProjectInfoDetailProps {
  template: FormTemplate;
}

export function ProjectInfoDetail({ template }: ProjectInfoDetailProps) {
  if (!template.projectMetadata) return null;
  
  const { projectName, companyName, location } = template.projectMetadata;
  
  // If no project info is available, don't render
  if (!projectName && !companyName && !location) return null;

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-2">Información del Proyecto</h3>
        <Separator className="mb-4" />
        
        <div className="grid gap-4">
          {projectName && (
            <div>
              <Label className="text-muted-foreground">Nombre del Proyecto</Label>
              <p className="font-medium">{projectName}</p>
            </div>
          )}
          
          {companyName && (
            <div>
              <Label className="text-muted-foreground">Razón Social</Label>
              <p className="font-medium">{companyName}</p>
            </div>
          )}
          
          {location && (
            <div>
              <Label className="text-muted-foreground">Ubicación</Label>
              <p className="font-medium">{location}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
