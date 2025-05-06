
import React, { useState, useEffect } from 'react';
import { FileText, CheckSquare, AlertTriangle, BarChart2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart } from '@/components/dashboard/BarChart';
import { PieChart } from '@/components/dashboard/PieChart';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { NegativeEventFilter } from '@/components/forms/NegativeEventFilter';
import { FormsTable } from '@/components/forms/FormsTable';
import { CompanySelector } from '@/components/forms/CompanySelector';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { FormResponse } from '@/types/forms';
import { useToast } from '@/hooks/use-toast';

// Colores para los gráficos de pie
const colorsPie = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedFormType, setSelectedFormType] = useState<string>('Todos');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [formTypes, setFormTypes] = useState<string[]>(['Todos']);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [negativeFilter, setNegativeFilter] = useState<'all' | 'yes' | 'no'>('all');
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
        const typedData: FormResponse[] = responsesData.map(item => ({
          ...item,
          status: item.status as 'Todo positivo' | 'Contiene item negativo'
        }));
        
        setFormResponses(typedData);
        
        // Extraer todos los tipos de formularios únicos
        const uniqueFormTypes = Array.from(new Set(typedData.map(form => form.form_type)));
        setFormTypes(['Todos', ...uniqueFormTypes]);
        
        // Extraer todas las empresas únicas
        const uniqueCompanies = Array.from(new Set(
          typedData
            .map(form => form.empresa)
            .filter(Boolean) as string[]
        ));
        setCompanies(uniqueCompanies);
        
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

  const handleCompanySelect = (company: string | null) => {
    setSelectedCompany(company);
    // Resetear la selección de tipo de formulario
    setSelectedFormType('Todos');
  };

  // Filtrar datos por empresa, tipo de formulario, rango de fecha y estado
  const getFilteredData = () => {
    return formResponses.filter(form => {
      const formDate = new Date(form.date);
      const isInDateRange = formDate >= startDate && formDate <= endDate;
      const matchesType = selectedFormType === 'Todos' || form.form_type === selectedFormType;
      const matchesCompany = selectedCompany === null || form.empresa === selectedCompany;
      
      const matchesStatus = negativeFilter === 'all' || 
        (negativeFilter === 'yes' && form.status === 'Contiene item negativo') ||
        (negativeFilter === 'no' && form.status === 'Todo positivo');
      
      return isInDateRange && matchesType && matchesCompany && matchesStatus;
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

  // Obtener tipos de formulario relevantes según la empresa seleccionada
  const getRelevantFormTypes = () => {
    if (selectedCompany) {
      // Si hay una empresa seleccionada, mostrar solo sus tipos de formulario
      const companyFormTypes = formResponses
        .filter(form => form.empresa === selectedCompany)
        .map(form => form.form_type);
      
      const uniqueTypes = Array.from(new Set(companyFormTypes));
      return ['Todos', ...uniqueTypes];
    }
    // Si no hay empresa seleccionada, mostrar todos los tipos de formulario
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
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h2 className="text-xl font-bold">Formularios por empresa</h2>
          <CompanySelector 
            companies={companies}
            selectedCompany={selectedCompany}
            onSelect={handleCompanySelect}
          />
        </div>
        
        <div className="mb-4">
          <NegativeEventFilter 
            value={negativeFilter}
            onChange={setNegativeFilter}
          />
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
            
            <PieChart 
              data={[
                { name: 'Todo positivo', value: stats.positivos },
                { name: 'Contiene item negativo', value: stats.negativos }
              ]} 
              title="Distribución de estados" 
              dataKey="value"
              nameKey="name"
              colors={colorsPie}
              className="w-full"
            />
            
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Lista de formularios</h2>
              <FormsTable forms={filteredData} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium">¿Necesitas importar nuevos formularios?</h3>
            <p className="text-sm text-muted-foreground">
              Importa formularios desde CSV, Excel o directamente desde JotForm
            </p>
          </div>
          <a href="/importar" className="shrink-0">
            <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">
              Importar datos
            </button>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
