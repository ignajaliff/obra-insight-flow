
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, FileText, Eye } from 'lucide-react';
import { FormTemplate } from '@/types/forms';
import { Link } from 'react-router-dom';

interface FormTemplateListProps {
  templates: FormTemplate[];
  onEdit: (template: FormTemplate) => void;
  onDelete: (id: string) => void;
}

export function FormTemplateList({ templates, onEdit, onDelete }: FormTemplateListProps) {
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-md bg-muted/5">
        <FileText className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-xl font-medium mb-1">No hay formularios creados</h3>
        <p className="text-muted-foreground mb-4">
          Crea tu primer formulario para empezar a recopilar datos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card key={template.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm font-medium text-muted-foreground">
              {template.fields.length} campos
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Actualizado: {new Date(template.updated_at).toLocaleDateString()}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/formularios/ver/${template.id}`}>
                <Eye size={16} className="mr-2" />
                Ver
              </Link>
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(template)}>
                <Edit size={16} className="mr-2" />
                Editar
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onDelete(template.id)}
              >
                <Trash2 size={16} className="mr-2" />
                Eliminar
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
