
import { useState, useEffect, useCallback } from 'react';
import { FormResponse } from '@/types/forms';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDashboardData = (refreshTrigger: number) => {
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [formTypes, setFormTypes] = useState<string[]>(['Todos']);
  const [projects, setProjects] = useState<string[]>(['Todos']);
  const [loading, setLoading] = useState(true);
  const [formStatsData, setFormStatsData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { toast } = useToast();

  // Función para cargar los datos con mejor manejo de errores
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Intentando cargar datos de formularios...");

      // Obtener respuestas de formulario directamente sin filtrar por fecha
      // Esto asegura que obtengamos todos los registros primero
      const { data: responsesData, error: responsesError } = await supabase
        .from('form_responses')
        .select('*');

      if (responsesError) {
        console.error('Error al cargar respuestas:', responsesError);
        throw responsesError;
      }

      console.log("Datos cargados:", responsesData?.length || 0, "registros");
      console.log("Registros individuales:", responsesData);

      if (!responsesData || responsesData.length === 0) {
        console.log("No se encontraron registros en form_responses");
        setFormResponses([]);
        setFormTypes(['Todos']);
        setProjects(['Todos']);
        setLoading(false);
        return;
      }

      // Asignar los datos sin aplicar ningún filtro inicialmente
      setFormResponses(responsesData);

      // Extraer todos los tipos de formularios únicos
      const uniqueFormTypes = Array.from(new Set(responsesData.map(form => form.form_type)));
      console.log("Tipos de formularios encontrados:", uniqueFormTypes);
      setFormTypes(['Todos', ...uniqueFormTypes]);

      // Extraer todos los proyectos únicos con verificación
      const uniqueProjects = Array.from(
        new Set(
          responsesData
            .filter(form => form.proyecto) // Filter out undefined proyectos
            .map(form => form.proyecto)
            .filter(Boolean) as string[]
        )
      );
      
      console.log("Proyectos encontrados:", uniqueProjects);
      setProjects(['Todos', ...uniqueProjects]);

      // Crear datos para gráficos y estadísticas
      const projectStats = uniqueProjects.map(project => {
        const projectForms = responsesData.filter(form => form.proyecto === project);
        return {
          name: project,
          value: projectForms.length,
          positivos: projectForms.filter(f => f.status === 'Todo positivo').length,
          negativos: projectForms.filter(f => f.status === 'Contiene item negativo').length
        };
      });
      setFormStatsData(projectStats);
      
      // Actualizar timestamp de última actualización
      setLastUpdated(new Date());

      toast({
        title: "Datos actualizados",
        description: `Se han cargado ${responsesData.length} registros correctamente`
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los datos. Intente refrescar nuevamente."
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Cargar datos cuando cambie el refreshTrigger
  useEffect(() => {
    console.log("Ejecutando fetchData...");
    fetchData();
  }, [fetchData, refreshTrigger]);

  return {
    formResponses,
    formTypes,
    projects,
    loading,
    formStatsData,
    lastUpdated
  };
};
