
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { FormTypesFilter } from '@/components/forms/FormTypesFilter';
import { FormsTable } from '@/components/forms/FormsTable';
import { CompanySelector } from '@/components/forms/CompanySelector';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormResponse } from '@/types/forms';

const FormsList = () => {
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [filteredForms, setFilteredForms] = useState<FormResponse[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedFormTypes, setSelectedFormTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const { toast } = useToast();

  // Cargar formularios desde Supabase
  useEffect(() => {
    const fetchForms = async () => {
      setIsLoading(true);
      try {
        // Obtener información de respuestas de formularios
        const { data, error } = await supabase
          .from('form_responses')
          .select('*')
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        // Transformar los datos si es necesario
        const formResponses = data.map(form => ({
          ...form,
          // Asegurar que status sea uno de los valores permitidos
          status: form.status as 'Todo positivo' | 'Contiene item negativo'
        })) as FormResponse[];
        
        setForms(formResponses);
        setFilteredForms(formResponses);
        
        // Extraer empresas únicas para el selector
        const uniqueCompanies = Array.from(new Set(
          formResponses
            .map(form => form.empresa)
            .filter(Boolean) as string[]
        ));
        setCompanies(uniqueCompanies);
      } catch (error) {
        console.error('Error loading forms:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar los formularios",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchForms();
  }, [toast]);

  // Filtrar formularios cuando cambien los criterios
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...forms];
      
      // Filtrar por tipo de formulario
      if (selectedFormTypes.length > 0) {
        filtered = filtered.filter(form => 
          selectedFormTypes.includes(form.form_type)
        );
      }
      
      // Filtrar por empresa
      if (selectedCompany) {
        filtered = filtered.filter(form => 
          form.empresa === selectedCompany
        );
      }
      
      // Filtrar por búsqueda de texto
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(form => 
          form.worker_name.toLowerCase().includes(query)
        );
      }
      
      // Filtrar por rango de fechas
      if (startDate && endDate) {
        filtered = filtered.filter(form => {
          const formDate = new Date(form.date);
          return formDate >= startDate && formDate <= endDate;
        });
      }
      
      setFilteredForms(filtered);
    };
    
    applyFilters();
  }, [forms, selectedFormTypes, searchQuery, startDate, endDate, selectedCompany]);

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  const handleCompanySelect = (company: string | null) => {
    setSelectedCompany(company);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Formularios</h1>
        <p className="text-muted-foreground">Listado completo de formularios registrados</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre de obrero..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="secondary">Exportar</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <DateRangeFilter 
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
          <FormTypesFilter 
            selectedTypes={selectedFormTypes}
            onSelectionChange={setSelectedFormTypes}
          />
          <CompanySelector
            companies={companies}
            selectedCompany={selectedCompany}
            onSelect={handleCompanySelect}
          />
        </div>
      </div>

      <div className="rounded-md bg-white">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <FormsTable forms={filteredForms} />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredForms.length} de {forms.length} formularios
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormsList;
