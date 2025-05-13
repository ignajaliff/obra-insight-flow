
import React, { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { FormsTable } from '@/components/forms/FormsTable';
import { FormResponse } from '@/types/forms';
import { NegativeEventFilter } from '@/components/forms/NegativeEventFilter';
import { Input } from '@/components/ui/input';

interface FormsListSectionProps {
  filteredData: FormResponse[];
}

export function FormsListSection({ filteredData }: FormsListSectionProps) {
  const [searchWorker, setSearchWorker] = useState('');
  const [negativeFilter, setNegativeFilter] = useState<'all' | 'yes' | 'no'>('all');

  // Apply search and status filters
  const searchAndFilteredData = filteredData.filter(form => {
    // Filter by worker search
    const matchesSearch = form.worker_name.toLowerCase().includes(searchWorker.toLowerCase());
    
    // Filter by status
    let matchesStatus = true;
    if (negativeFilter === 'yes') {
      matchesStatus = form.status === 'Contiene item negativo';
    } else if (negativeFilter === 'no') {
      matchesStatus = form.status === 'Todo positivo';
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Lista de formularios {filteredData.length > 0 ? `(${filteredData.length})` : ''}
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por obrero..."
            value={searchWorker}
            onChange={(e) => setSearchWorker(e.target.value)}
            className="pl-9"
          />
        </div>
        <div>
          <NegativeEventFilter value={negativeFilter} onChange={setNegativeFilter} />
        </div>
      </div>
      
      {searchAndFilteredData.length > 0 ? (
        <FormsTable forms={searchAndFilteredData} />
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
  );
}
