
import React from 'react';
import { FileText } from 'lucide-react';
import { FormsTable } from '@/components/forms/FormsTable';
import { FormResponse } from '@/types/forms';

interface FormsListSectionProps {
  filteredData: FormResponse[];
}

export function FormsListSection({ filteredData }: FormsListSectionProps) {
  return (
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
  );
}
