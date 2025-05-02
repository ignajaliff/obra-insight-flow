
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { FormTypesFilter, FORM_TYPES } from '@/components/forms/FormTypesFilter';
import { NegativeEventFilter } from '@/components/forms/NegativeEventFilter';
import { FormEntry, FormsTable } from '@/components/forms/FormsTable';
import { Search } from 'lucide-react';

// Sample data for demo
const sampleForms: FormEntry[] = Array.from({ length: 25 }, (_, index) => ({
  id: `form-${index + 1}`,
  workerName: `Trabajador ${Math.floor(index / 5) + 1}`,
  formType: FORM_TYPES[index % FORM_TYPES.length],
  date: new Date(
    Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
  ).toLocaleDateString(),
  hasNegativeEvent: index % 5 === 0,
  driveLink: 'https://drive.google.com/file',
  reviewStatus: index % 3 === 0 ? 'pending' : 'reviewed',
}));

const FormsList = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedFormTypes, setSelectedFormTypes] = useState<string[]>([]);
  const [negativeEventFilter, setNegativeEventFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Filter forms based on selected criteria
  const filteredForms = sampleForms.filter(form => {
    // Filter by form type
    if (selectedFormTypes.length > 0 && !selectedFormTypes.includes(form.formType)) {
      return false;
    }

    // Filter by negative event
    if (negativeEventFilter === 'yes' && !form.hasNegativeEvent) {
      return false;
    }
    if (negativeEventFilter === 'no' && form.hasNegativeEvent) {
      return false;
    }

    // Filter by search query
    if (searchQuery && !form.workerName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by date range
    if (startDate && endDate) {
      const formDate = new Date(form.date);
      if (formDate < startDate || formDate > endDate) {
        return false;
      }
    }

    return true;
  });

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
        <FormsTable forms={filteredForms} />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredForms.length} de {sampleForms.length} formularios
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
