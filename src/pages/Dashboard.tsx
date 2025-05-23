
import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useToast } from '@/hooks/use-toast';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProjectsSection } from '@/components/dashboard/CompaniesSection';
import { FormStatsSection } from '@/components/dashboard/FormStatsSection';
import { FormTypesSelector } from '@/components/dashboard/FormTypesSelector';
import { FormsListSection } from '@/components/dashboard/FormsListSection';
import { ProjectSelector } from '@/components/dashboard/ProjectSelector';

const Dashboard = () => {
  // Set start date to one year ago by default to include more records
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
  // Set end date to one year in future to include future-dated records
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
  const [showAllDates, setShowAllDates] = useState<boolean>(false);
  const [selectedFormType, setSelectedFormType] = useState<string>('Todos');
  const [selectedProject, setSelectedProject] = useState<string>('Todos');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const { toast } = useToast();
  
  // Use custom hook to fetch and manage data
  const { 
    formResponses, 
    formTypes, 
    projects, 
    loading, 
    formStatsData, 
    lastUpdated 
  } = useDashboardData(refreshTrigger);

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    if (start) setStartDate(start);
    if (end) setEndDate(end);
    setShowAllDates(false);
  };

  const handleToggleShowAllDates = () => {
    setShowAllDates(!showAllDates);
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
  const getFilteredData = useCallback(() => {
    console.log("Filtrando datos con rango de fechas:", startDate, "a", endDate);
    console.log("Total registros antes de filtrar:", formResponses.length);
    console.log("Mostrar todas las fechas:", showAllDates);
    
    return formResponses.filter(form => {
      // Si showAllDates está activado, no filtrar por fecha
      const formDate = new Date(form.date);
      const isInDateRange = showAllDates || (formDate >= startDate && formDate <= endDate);
      const matchesType = selectedFormType === 'Todos' || form.form_type === selectedFormType;
      const matchesProject = selectedProject === 'Todos' || form.proyecto === selectedProject;
      
      return isInDateRange && matchesType && matchesProject;
    });
  }, [formResponses, startDate, endDate, selectedFormType, selectedProject, showAllDates]);

  // Obtener formularios filtrados solo para visualización
  const filteredData = getFilteredData();
  console.log("Total registros después de filtrar:", filteredData.length);

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
      const projectForms = formResponses.filter(form => form.proyecto === proyecto);
      
      const formTypesForProject = Array.from(new Set(projectForms.map(form => form.form_type)));
      
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

  // Obtener tipos de formulario relevantes según el proyecto seleccionado
  const getRelevantFormTypes = useCallback(() => {
    if (selectedProject && selectedProject !== 'Todos') {
      // Si hay un proyecto seleccionado, mostrar solo sus tipos de formulario
      const projectFormTypes = formResponses.filter(form => form.proyecto === selectedProject).map(form => form.form_type);
      const uniqueTypes = Array.from(new Set(projectFormTypes));
      return ['Todos', ...uniqueTypes];
    }
    // Si no hay proyecto seleccionado o es "Todos", mostrar todos los tipos de formulario
    return formTypes;
  }, [formResponses, selectedProject, formTypes]);

  // Lista de tipos de formulario relevantes
  const relevantFormTypes = getRelevantFormTypes();

  return (
    <div className="space-y-6">
      {/* Header with date filters and refresh button */}
      <DashboardHeader 
        startDate={startDate}
        endDate={endDate}
        onDateChange={handleDateChange}
        onRefresh={handleRefresh}
        loading={loading}
        lastUpdated={lastUpdated}
        totalRecords={formResponses.length}
        showAllDates={showAllDates}
        onToggleShowAllDates={handleToggleShowAllDates}
      />
      
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
              
              <ProjectSelector
                projects={projects}
                selectedProject={selectedProject}
                onProjectChange={setSelectedProject}
              />
              
              <h3 className="text-lg font-medium mb-4">Formularios por proyecto</h3>
            </div>
            
            {/* Main Form Types and Content Section */}
            <Tabs defaultValue={selectedFormType} value={selectedFormType} onValueChange={setSelectedFormType}>
              <FormTypesSelector
                formTypes={relevantFormTypes}
                selectedFormType={selectedFormType}
                onFormTypeChange={setSelectedFormType}
              />
              
              <TabsContent value={selectedFormType} className="space-y-6 mt-4">
                {/* Statistics Cards */}
                <FormStatsSection stats={stats} />
                
                {/* Forms List Table */}
                <FormsListSection filteredData={filteredData} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
