
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
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
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
    return formResponses.filter(form => {
      const formDate = new Date(form.date);
      const isInDateRange = formDate >= startDate && formDate <= endDate;
      const matchesType = selectedFormType === 'Todos' || form.form_type === selectedFormType;
      const matchesProject = selectedProject === 'Todos' || form.proyecto === selectedProject;
      
      return isInDateRange && matchesType && matchesProject;
    });
  }, [formResponses, startDate, endDate, selectedFormType, selectedProject]);

  // Obtener formularios filtrados solo para visualización
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
            <Tabs value={selectedFormType} onValueChange={setSelectedFormType}>
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
