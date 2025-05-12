
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, CheckSquare, AlertTriangle, RefreshCw } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { FormsTable } from '@/components/forms/FormsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { FormResponse } from '@/types/forms';
import { useToast } from '@/hooks/use-toast';
import { ProjectsSection } from '@/components/dashboard/CompaniesSection';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedFormType, setSelectedFormType] = useState<string>('Todos');
  const [selectedProject, setSelectedProject] = useState<string>('Todos');
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [formTypes, setFormTypes] = useState<string[]>(['Todos']);
  const [projects, setProjects] = useState<string[]>(['Todos']);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [formStatsData, setFormStatsData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Función para cargar los datos con mejor manejo de errores
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Intentando cargar datos de formularios...");

      // Configuración de fetch para evitar caché
      const fetchOptions = {
        cache: 'no-store' as RequestCache,
        headers: {
          'Cache-Control': 'no-cache'
        }
      };

      // Obtener respuestas de formulario con .select() explícito para garantizar todos los campos
      const { data: responsesData, error: responsesError } = await supabase
        .from('form_responses')
        .select('*');

      if (responsesError) {
        console.error('Error al cargar respuestas:', responsesError);
        throw responsesError;
      }

      console.log("Datos cargados:", responsesData?.length || 0, "registros");
      console.log("Registros cargados:", responsesData);

      if (!responsesData || responsesData.length === 0) {
        console.log("No se encontraron registros en form_responses");
        setFormResponses([]);
        setFormTypes(['Todos']);
        setProjects(['Todos']);
        setLoading(false);
        return;
      }

      // Asegurar que los datos cumplen con el tipo FormResponse
      const typedData: FormResponse[] = responsesData;
      
      // Guardar los datos en el estado
      setFormResponses(typedData);

      // Extraer todos los tipos de formularios únicos
      const uniqueFormTypes = Array.from(new Set(typedData.map(form => form.form_type)));
      console.log("Tipos de formularios encontrados:", uniqueFormTypes);
      setFormTypes(['Todos', ...uniqueFormTypes]);

      // Extraer todos los proyectos únicos con verificación
      const uniqueProjects = Array.from(
        new Set(
          typedData
            .filter(form => form.proyecto) // Filter out undefined proyectos
            .map(form => form.proyecto)
            .filter(Boolean) as string[]
        )
      );
      
      console.log("Proyectos encontrados:", uniqueProjects);
      setProjects(['Todos', ...uniqueProjects]);
      
      // Si el proyecto seleccionado no está en la lista, resetear a 'Todos'
      if (selectedProject !== 'Todos' && !uniqueProjects.includes(selectedProject)) {
        setSelectedProject('Todos');
      }

      // Crear datos para gráficos y estadísticas
      const projectStats = uniqueProjects.map(project => {
        const projectForms = typedData.filter(form => form.proyecto === project);
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
  }, [selectedProject, toast]);
  
  // Cargar datos cuando cambie el refreshTrigger
  useEffect(() => {
    console.log("Ejecutando fetchData...");
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    if (start) setStartDate(start);
    if (end) setEndDate(end);
  };

  // Función para refrescar datos manualmente
  const handleRefresh = () => {
    console.log("Refrescando datos manualmente...");
    setRefreshTrigger(prev => prev + 1);
    toast({
      title: "Actualizando datos",
      description: "Los datos están siendo actualizados"
    });
  };

  // Filtrar datos por proyecto, tipo de formulario y rango de fecha
  const getFilteredData = () => {
    return formResponses.filter(form => {
      const formDate = new Date(form.date);
      const isInDateRange = formDate >= startDate && formDate <= endDate;
      const matchesType = selectedFormType === 'Todos' || form.form_type === selectedFormType;
      const matchesProject = selectedProject === 'Todos' || form.proyecto === selectedProject;
      return isInDateRange && matchesType && matchesProject;
    });
  };

  // Obtener formularios filtrados
  const filteredData = getFilteredData();

  // Calcular estadísticas para los formularios filtrados
  const stats = {
    total: filteredData.length,
    positivos: filteredData.filter(f => f.status === 'Todo positivo').length,
    negativos: filteredData.filter(f => f.status === 'Contiene item negativo').length
  };

  // Preparar datos para la sección de proyectos
  const projectsWithFormTypes = projects
    .filter(p => p !== 'Todos')
    .map(proyecto => {
      console.log(`Procesando proyecto: ${proyecto}`);
      const projectForms = formResponses.filter(form => form.proyecto === proyecto);
      console.log(`Formularios encontrados para ${proyecto}: ${projectForms.length}`);
      
      const formTypesForProject = Array.from(new Set(projectForms.map(form => form.form_type)));
      console.log(`Tipos de formulario para ${proyecto}: ${formTypesForProject.join(', ')}`);
      
      return {
        proyecto,
        formTypes: formTypesForProject.map(type => ({
          id: type,
          name: type,
          description: `Formulario de ${type}`
        })),
        formCount: projectForms.length
      };
    });

  console.log("Todos los proyectos con sus tipos de formulario:", projectsWithFormTypes);

  // Obtener tipos de formulario relevantes según el proyecto seleccionado
  const getRelevantFormTypes = () => {
    if (selectedProject && selectedProject !== 'Todos') {
      // Si hay un proyecto seleccionado, mostrar solo sus tipos de formulario
      const projectFormTypes = formResponses.filter(form => form.proyecto === selectedProject).map(form => form.form_type);
      const uniqueTypes = Array.from(new Set(projectFormTypes));
      return ['Todos', ...uniqueTypes];
    }
    // Si no hay proyecto seleccionado o es "Todos", mostrar todos los tipos de formulario
    return formTypes;
  };

  // Lista de tipos de formulario relevantes
  const relevantFormTypes = getRelevantFormTypes();

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4">
        <div>
          <p className="text-muted-foreground">Resumen de los formularios recibidos</p>
          <p className="text-xs text-muted-foreground">Última actualización: {lastUpdated.toLocaleTimeString()}</p>
          <p className="text-xs text-muted-foreground">Total registros disponibles: {formResponses.length}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refrescar datos
          </Button>
          <DateRangeFilter startDate={startDate} endDate={endDate} onDateChange={handleDateChange} />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Sección de Proyectos */}
          <ProjectsSection projects={projectsWithFormTypes} isLoading={loading} />
          
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold mb-4">Proyectos</h2>
              
              {/* Projects as Tabs with deeper blue styling */}
              <Tabs 
                defaultValue={projects[0] || 'Todos'} 
                value={selectedProject} 
                onValueChange={setSelectedProject}
              >
                <TabsList className="w-full flex justify-start mb-6 overflow-x-auto bg-secondary/30 p-2 rounded-lg">
                  {projects.map(project => (
                    <TabsTrigger 
                      key={project} 
                      value={project} 
                      className="whitespace-nowrap text-base py-3 px-6 font-medium data-[state=active]:bg-[#1A4B7C] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      {project}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              
              <h3 className="text-lg font-medium mb-4">Formularios por proyecto</h3>
            </div>
            
            <Tabs 
              defaultValue={relevantFormTypes[0]} 
              value={selectedFormType} 
              onValueChange={setSelectedFormType}
            >
              <TabsList className="w-full flex justify-start mb-4 overflow-x-auto">
                {relevantFormTypes.map(type => (
                  <TabsTrigger key={type} value={type} className="whitespace-nowrap">
                    {type}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedFormType} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <StatCard 
                    title="Total Formularios" 
                    value={stats.total} 
                    description="Último período" 
                    icon={<FileText />} 
                  />
                  <StatCard 
                    title="Todo positivo" 
                    value={stats.positivos} 
                    description={`${Math.round(stats.total > 0 ? stats.positivos / stats.total * 100 : 0)}% del total`} 
                    icon={<CheckSquare className="text-green-500" />} 
                  />
                  <StatCard 
                    title="Con items negativos" 
                    value={stats.negativos} 
                    description={`${Math.round(stats.total > 0 ? stats.negativos / stats.total * 100 : 0)}% del total`} 
                    icon={<AlertTriangle className="text-red-500" />} 
                  />
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    Lista de formularios {filteredData.length > 0 ? `(${filteredData.length})` : ''}
                  </h2>
                  {filteredData.length > 0 ? (
                    <FormsTable forms={filteredData} />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
                      <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-xl font-medium mb-1">No se encontraron formularios</h3>
                      <p className="text-muted-foreground">
                        No hay formularios que coincidan con los filtros seleccionados.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
