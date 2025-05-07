
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export function ProjectsSection({ projects, isLoading }: ProjectsSectionProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proyectos</h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/formularios/disponibles">Ver todos</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Card key={project.proyecto} className="flex flex-col bg-purple-50 border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 text-purple-600" size={20} />
                  {project.proyecto}
                </CardTitle>
                <CardDescription>Proyecto registrado</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{project.formTypes.length}</span> tipos de formulario
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{project.formCount || 0}</span> formularios completados
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full border-purple-200 hover:bg-purple-100">
                  <Link to={`/formularios/disponibles`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Ver formularios
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center p-12">
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-xl font-medium mb-1">No hay proyectos disponibles</h3>
            <p className="text-muted-foreground">
              No se encontraron proyectos registrados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
