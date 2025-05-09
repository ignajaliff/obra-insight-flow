
import React from 'react';
import { FormField } from '@/types/forms';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SignatureField } from '../SignatureField';

interface FormFieldsProps {
  fields: FormField[];
  formValues: Record<string, any>;
  handleChange: (field: FormField, value: any) => void;
  readOnly?: boolean;
  isMobile?: boolean;
}

export function FormFields({ 
  fields, 
  formValues, 
  handleChange, 
  readOnly = false,
  isMobile = false
}: FormFieldsProps) {
  console.log("FormFields rendering with isMobile:", isMobile);
  console.log("Fields count:", fields.length);
  
  const renderField = (field: FormField) => {
    console.log(`Rendering field: ${field.name}, type: ${field.type}, isMobile: ${isMobile}`);
    
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            disabled={readOnly}
            required={field.required}
            className="w-full"
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            disabled={readOnly}
            required={field.required}
            rows={3}
            className="w-full"
          />
        );
        
      case 'select':
        return (
          <Select
            value={formValues[field.name] || ''}
            onValueChange={(value) => handleChange(field, value)}
            disabled={readOnly}
          >
            <SelectTrigger id={field.id} className="w-full">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent 
              position={isMobile ? "popper" : "item-aligned"}
              side={isMobile ? "bottom" : undefined}
              align={isMobile ? "center" : undefined}
              avoidCollisions={true}
              className={isMobile ? "max-w-[90vw]" : undefined}
            >
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={field.id}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formValues[field.name] && "text-muted-foreground"
                )}
                disabled={readOnly}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formValues[field.name] ? (
                  format(new Date(formValues[field.name]), 'PP', { locale: es })
                ) : (
                  <span>Seleccionar fecha...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0" 
              align={isMobile ? "center" : "start"}
              sideOffset={isMobile ? 5 : 10}
              side={isMobile ? "bottom" : "right"}
              avoidCollisions={true}
            >
              <Calendar
                mode="single"
                selected={formValues[field.name] ? new Date(formValues[field.name]) : undefined}
                onSelect={(date) => handleChange(field, date?.toISOString())}
                initialFocus
                className={cn("p-3")} 
              />
            </PopoverContent>
          </Popover>
        );
        
      case 'signature':
        return (
          <SignatureField
            id={field.id}
            value={formValues[field.name] || null}
            onChange={(value) => handleChange(field, value)}
            readOnly={readOnly}
          />
        );
        
      default:
        console.log(`Unknown field type: ${field.type}`);
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      {fields.length > 0 ? (
        fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="block text-base font-medium">
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {renderField(field)}
          </div>
        ))
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          Este formulario no contiene campos.
        </div>
      )}
    </div>
  );
}
