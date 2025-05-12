
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <Tabs 
      defaultValue={formTypes[0]} 
      value={selectedFormType} 
      onValueChange={onFormTypeChange}
    >
      <TabsList className="w-full flex justify-start mb-4 overflow-x-auto">
        {formTypes.map(type => (
          <TabsTrigger key={type} value={type} className="whitespace-nowrap">
            {type}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
