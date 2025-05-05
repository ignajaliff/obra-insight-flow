
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
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormResponse } from '@/types/forms';

interface FormType {
  id: string;
  type: string;
  count: number;
}

const AvailableForms = () => {
  const [formTypes, setFormTypes] = useState<FormType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFormTypes = async () => {
      setIsLoading(true);
      try {
        // Obtener todos los tipos de formularios únicos y su conteo
        const { data, error } = await supabase
          .from('form_responses')
          .select('form_type')
          .order('form_type');
        
        if (error) throw error;
        
        // Agrupar por tipo y contar ocurrencias
        const typesCount: Record<string, number> = {};
        data.forEach(item => {
          const type = item.form_type;
          typesCount[type] = (typesCount[type] || 0) + 1;
        });
        
        // Convertir a array para mostrar en la UI
        const typesArray: FormType[] = Object.entries(typesCount).map(([type, count], index) => ({
          id: `type-${index}`,
          type,
          count
        }));
        
        setFormTypes(typesArray);
      } catch (error) {
        console.error('Error loading form types:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los tipos de formularios",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFormTypes();
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formTypes.length > 0 ? (
            formTypes.map((formType) => (
              <Card key={formType.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{formType.type}</CardTitle>
                  <CardDescription>Formulario de registro</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm">
                    {formType.count} formularios completados
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
            <div className="col-span-full text-center p-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-xl font-medium mb-1">No hay formularios disponibles</h3>
              <p className="text-muted-foreground">
                No se encontraron formularios para completar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableForms;
