import React, { useState, useEffect } from 'react';
import { FileText, CheckSquare, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { FormsTable } from '@/components/forms/FormsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { FormResponse } from '@/types/forms';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedFormType, setSelectedFormType] = useState<string>('Todos');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [formTypes, setFormTypes] = useState<string[]>(['Todos']);
  const [projects, setProjects] = useState<string[]>([]); // Initialize with empty array
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Cargar formularios
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener respuestas de formulario
        const { data: responsesData, error: responsesError } = await supabase
          .from('form_responses')
          .select('*');
        
        if (responsesError) throw responsesError;
        
        // Asegurar que los datos cumplen con el tipo FormResponse
        const typedData: FormResponse[] = responsesData ? responsesData.map(item => ({
          ...item,
          status: item.status as 'Todo positivo' | 'Contiene item negativo'
        })) : [];
        
        setFormResponses(typedData);
        
        // Extraer todos los tipos de formularios únicos
        const uniqueFormTypes = Array.from(new Set(typedData.map(form => form.form_type)));
        setFormTypes(['Todos', ...uniqueFormTypes]);
        
        // Extraer todos los proyectos únicos
        const uniqueProjects = Array.from(new Set(
          typedData
            .filter(form => form.proyecto) // Filter out undefined proyectos
            .map(form => form.proyecto)
            .filter(Boolean) as string[]
        ));
        
        setProjects(['Todos', ...uniqueProjects]);
        setSelectedProject('Todos'); // Set default selection to "Todos"
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los datos",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    if (start) setStartDate(start);
    if (end) setEndDate(end);
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

  // Obtener tipos de formulario relevantes según el proyecto seleccionado
  const getRelevantFormTypes = () => {
    if (selectedProject && selectedProject !== 'Todos') {
      // Si hay un proyecto seleccionado, mostrar solo sus tipos de formulario
      const projectFormTypes = formResponses
        .filter(form => form.proyecto === selectedProject)
        .map(form => form.form_type);
      
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
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de los formularios recibidos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DateRangeFilter 
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-4">Formularios por proyecto</h2>
          
          {/* Projects as Tabs with dark blue styling instead of yellow */}
          <Tabs defaultValue={projects[0] || 'Todos'} value={selectedProject || 'Todos'} onValueChange={setSelectedProject}>
            <TabsList className="w-full flex justify-start mb-6 overflow-x-auto bg-secondary/30 p-2 rounded-lg">
              {projects.map((project) => (
                <TabsTrigger 
                  key={project} 
                  value={project} 
                  className="whitespace-nowrap text-base py-3 px-6 font-medium data-[state=active]:bg-[#1A3A5F] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                >
                  {project}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        <Tabs defaultValue={relevantFormTypes[0]} value={selectedFormType} onValueChange={setSelectedFormType}>
          <TabsList className="w-full flex justify-start mb-4 overflow-x-auto">
            {relevantFormTypes.map((type) => (
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
                icon={<AlertTriangle className="text-danger-500" />}
              />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Lista de formularios</h2>
              <FormsTable forms={filteredData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
