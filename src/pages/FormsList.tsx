
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { FormTypesFilter, FORM_TYPES } from '@/components/forms/FormTypesFilter';
import { NegativeEventFilter } from '@/components/forms/NegativeEventFilter';
import { FormEntry, FormsTable } from '@/components/forms/FormsTable';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const FormsList = () => {
  const [forms, setForms] = useState<FormEntry[]>([]);
  const [filteredForms, setFilteredForms] = useState<FormEntry[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedFormTypes, setSelectedFormTypes] = useState<string[]>([]);
  const [negativeEventFilter, setNegativeEventFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Cargar formularios desde Supabase
  useEffect(() => {
    const fetchForms = async () => {
      setIsLoading(true);
      try {
        // Obtener información de envíos de formularios
        const { data: submissions, error: submissionsError } = await supabase
          .from('form_submissions')
          .select(`
            id,
            has_negative_events,
            drive_link,
            review_status,
            submission_date,
            users(name),
            form_templates(name)
          `)
          .order('submission_date', { ascending: false });
        
        if (submissionsError) throw submissionsError;
        
        // Formatear los datos para la tabla
        const formattedForms: FormEntry[] = submissions.map((submission: any) => ({
          id: submission.id,
          workerName: submission.users?.name || 'Usuario desconocido',
          formType: submission.form_templates?.name || 'Formulario desconocido',
          date: new Date(submission.submission_date).toLocaleDateString(),
          hasNegativeEvent: submission.has_negative_events || false,
          driveLink: submission.drive_link || 'https://drive.google.com/file',
          reviewStatus: submission.review_status as 'reviewed' | 'pending'
        }));
        
        setForms(formattedForms);
        setFilteredForms(formattedForms);
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
          selectedFormTypes.includes(form.formType)
        );
      }
      
      // Filtrar por eventos negativos
      if (negativeEventFilter === 'yes') {
        filtered = filtered.filter(form => form.hasNegativeEvent);
      } else if (negativeEventFilter === 'no') {
        filtered = filtered.filter(form => !form.hasNegativeEvent);
      }
      
      // Filtrar por búsqueda de texto
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(form => 
          form.workerName.toLowerCase().includes(query)
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
  }, [forms, selectedFormTypes, negativeEventFilter, searchQuery, startDate, endDate]);

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
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
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm text-muted-foreground mr-2">
            Eventos negativos:
          </div>
          <NegativeEventFilter 
            value={negativeEventFilter}
            onChange={setNegativeEventFilter}
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
