
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FormTypesSelectorProps {
  formTypes: string[];
  selectedFormType: string;
  onFormTypeChange: (value: string) => void;
}

export function FormTypesSelector({ 
  formTypes, 
  selectedFormType, 
  onFormTypeChange 
}: FormTypesSelectorProps) {
  return (
    <TabsList className="w-full flex justify-start mb-4 overflow-x-auto">
      {formTypes.map(type => (
        <TabsTrigger key={type} value={type} className="whitespace-nowrap">
          {type}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
