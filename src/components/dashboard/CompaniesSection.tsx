
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, FileText } from 'lucide-react';

interface ProjectWithFormTypes {
  proyecto: string;
  formTypes: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  formCount?: number;
}

interface ProjectsSectionProps {
  projects: ProjectWithFormTypes[];
  isLoading: boolean;
}

export function ProjectsSection({
  projects,
  isLoading
}: ProjectsSectionProps) {
  // Log data on mount and when projects change
  useEffect(() => {
    console.log("ProjectsSection received projects:", projects);
  }, [projects]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No hay proyectos disponibles</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Resumen de Proyectos</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => (
          <Card key={project.proyecto} className="overflow-hidden">
            <CardHeader className="bg-secondary/20 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="h-5 w-5" />
                {project.proyecto}
              </CardTitle>
              <CardDescription>
                {project.formCount} formularios
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-sm space-y-1">
                <p className="font-medium">Tipos de formulario:</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {project.formTypes.slice(0, 3).map((type) => (
                    <li key={type.id} className="text-xs">{type.name}</li>
                  ))}
                  {project.formTypes.length > 3 && (
                    <li className="text-xs text-muted-foreground">
                      ...y {project.formTypes.length - 3} más
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
