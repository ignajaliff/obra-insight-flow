
import React from 'react';
import { Check } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export const FORM_TYPES = [
  'Inspección de seguridad',
  'Reporte diario',
  'Control de calidad',
  'Incidentes',
  'Entrega de EPP',
];

interface FormTypesFilterProps {
  selectedTypes: string[];
  onSelectionChange: (types: string[]) => void;
}

export function FormTypesFilter({ selectedTypes, onSelectionChange }: FormTypesFilterProps) {
  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onSelectionChange(selectedTypes.filter((t) => t !== type));
    } else {
      onSelectionChange([...selectedTypes, type]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange([...FORM_TYPES]);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Tipo de formulario {selectedTypes.length > 0 && `(${selectedTypes.length})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Tipos de formulario</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {FORM_TYPES.map((type) => (
          <DropdownMenuCheckboxItem
            key={type}
            checked={selectedTypes.includes(type)}
            onCheckedChange={() => handleTypeToggle(type)}
          >
            {type}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <div className="flex justify-between p-2">
          <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs">
            Seleccionar todos
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs">
            Limpiar
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
