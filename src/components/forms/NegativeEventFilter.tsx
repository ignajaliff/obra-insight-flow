
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlertTriangle } from 'lucide-react';

type FilterState = 'all' | 'yes' | 'no';

interface NegativeEventFilterProps {
  value: FilterState;
  onChange: (value: FilterState) => void;
}

export function NegativeEventFilter({ value, onChange }: NegativeEventFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm whitespace-nowrap hidden sm:inline flex items-center">
        <AlertTriangle size={16} className="mr-1 text-amber-500" />
        Eventos negativos:
      </span>
      <ToggleGroup type="single" value={value} onValueChange={(v) => onChange(v as FilterState || 'all')} className="border rounded-md">
        <ToggleGroupItem value="all" aria-label="Todos los formularios">
          Todos
        </ToggleGroupItem>
        <ToggleGroupItem value="yes" aria-label="Con eventos negativos">
          Con eventos
        </ToggleGroupItem>
        <ToggleGroupItem value="no" aria-label="Sin eventos negativos">
          Sin eventos
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
