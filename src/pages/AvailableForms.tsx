
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormResponse } from '@/types/forms';

interface GroupedFormResponses {
  proyecto: string;
  formTypes: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

const AvailableForms = () => {
  const [projects, setProjects] = useState<GroupedFormResponses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFormResponses = async () => {
      setIsLoading(true);
      try {
        // Obtener todos los formularios
        const { data: formResponses, error: formResponsesError } = await supabase
          .from('form_responses')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (formResponsesError) throw formResponsesError;
        
        // Agrupar por proyecto
        const projectsMap = new Map<string, GroupedFormResponses>();
        
        formResponses.forEach((response: any) => {
          // Si el proyecto no existe en el mapa, crearlo
          if (!response.proyecto) return;
          
          if (!projectsMap.has(response.proyecto)) {
            projectsMap.set(response.proyecto, {
              proyecto: response.proyecto,
              formTypes: []
            });
          }
          
          // Verificar si el tipo de formulario ya está agregado
          const project = projectsMap.get(response.proyecto);
          if (project) {
            const existingFormType = project.formTypes.find(
              formType => formType.name === response.form_type
            );
            
            if (!existingFormType) {
              project.formTypes.push({
                id: response.form_type_id || response.id,
                name: response.form_type,
                description: `Formulario de ${response.form_type}`
              });
            }
          }
        });
        
        // Convertir el mapa en un array para el estado
        setProjects(Array.from(projectsMap.values()));
      } catch (error) {
        console.error('Error loading form responses:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los formularios disponibles",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFormResponses();
  }, [toast]);

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Formularios Disponibles</h1>
          <p className="text-muted-foreground">
            Selecciona un tipo de formulario para completar
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.proyecto} className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Building className="text-primary" size={20} />
                  <h2 className="text-xl font-semibold">{project.proyecto}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.formTypes.length > 0 ? (
                    project.formTypes.map((formType) => (
                      <Card key={formType.id} className="flex flex-col">
                        <CardHeader>
                          <CardTitle>{formType.name}</CardTitle>
                          <CardDescription>
                            {formType.description || 'Formulario de registro'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm text-muted-foreground">
                            Proyecto: {project.proyecto}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild className="w-full">
                            <Link to={`/formularios/rellenar/${formType.id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Completar Formulario
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-6">
                      <p className="text-muted-foreground">
                        No hay formularios disponibles para este proyecto.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-xl font-medium mb-1">No hay proyectos disponibles</h3>
              <p className="text-muted-foreground">
                No se encontraron proyectos o formularios para completar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableForms;
