
import React from 'react';
import { Button } from '@/components/ui/button';

interface NegativeEventFilterProps {
  value: 'all' | 'yes' | 'no';
  onChange: (value: 'all' | 'yes' | 'no') => void;
}

export function NegativeEventFilter({ value, onChange }: NegativeEventFilterProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={value === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('all')}
      >
        Todos
      </Button>
      <Button
        variant={value === 'no' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('no')}
      >
        Todo positivo
      </Button>
      <Button
        variant={value === 'yes' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('yes')}
      >
        Con item negativo
      </Button>
    </div>
  );
}
