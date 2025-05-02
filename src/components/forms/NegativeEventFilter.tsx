
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type FilterState = 'all' | 'yes' | 'no';

interface NegativeEventFilterProps {
  value: FilterState;
  onChange: (value: FilterState) => void;
}

export function NegativeEventFilter({ value, onChange }: NegativeEventFilterProps) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => onChange(v as FilterState || 'all')}>
      <ToggleGroupItem value="all" aria-label="Todos los formularios">
        Todos
      </ToggleGroupItem>
      <ToggleGroupItem value="yes" aria-label="Con eventos negativos">
        Con eventos negativos
      </ToggleGroupItem>
      <ToggleGroupItem value="no" aria-label="Sin eventos negativos">
        Sin eventos negativos
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
