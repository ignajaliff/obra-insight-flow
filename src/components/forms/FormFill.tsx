
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { FormField, FormTemplate } from '@/types/forms';
import { useToast } from '@/hooks/use-toast';

interface FormFillProps {
  template: FormTemplate;
  userName: string;
  onSubmit: (formData: any) => void;
}

export function FormFill({ template, userName, onSubmit }: FormFillProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const { toast } = useToast();

  const handleChange = (field: FormField, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [field.name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    const missingRequiredFields = template.fields
      .filter((field) => field.required && !formValues[field.name])
      .map((field) => field.label);
    
    if (missingRequiredFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: `Por favor completa los siguientes campos: ${missingRequiredFields.join(', ')}`,
      });
      return;
    }

    // Verificar si hay campos negativos marcados
    const hasNegativeEvents = template.fields
      .filter((field) => field.isNegativeIndicator)
      .some((field) => {
        if (field.type === 'checkbox') return formValues[field.name] === false;
        return !!formValues[field.name];
      });

    // Preparar datos del formulario para enviar
    const submissionData = {
      templateId: template.id,
      templateName: template.name,
      userName,
      values: formValues,
      hasNegativeEvents,
      date: new Date().toISOString(),
    };

    onSubmit(submissionData);
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            required={field.required}
          />
        );
      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            required={field.required}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={field.id}
              checked={formValues[field.name] || false}
              onCheckedChange={(checked) => handleChange(field, checked)}
            />
            <label
              htmlFor={field.id}
              className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                field.isNegativeIndicator && formValues[field.name] === false && "text-red-500"
              )}
            >
              {field.label}
            </label>
          </div>
        );
      case 'select':
        return (
          <Select
            value={formValues[field.name] || ''}
            onValueChange={(value) => handleChange(field, value)}
          >
            <SelectTrigger id={field.id}>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
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
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={field.id}
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formValues[field.name] && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formValues[field.name] ? (
                    format(new Date(formValues[field.name]), 'PPP', { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formValues[field.name] ? new Date(formValues[field.name]) : undefined}
                  onSelect={(date) => handleChange(field, date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{template.name}</h2>
        <p className="text-muted-foreground">{template.description}</p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Usuario</Label>
          <Input value={userName} disabled />
        </div>

        {template.fields.map((field) => (
          <div key={field.id} className="grid gap-2">
            {field.type !== 'checkbox' && (
              <Label 
                htmlFor={field.id} 
                className={cn(
                  field.isNegativeIndicator && "flex items-center gap-2"
                )}
              >
                {field.label}
                {field.isNegativeIndicator && (
                  <span className="text-xs bg-red-100 text-red-800 rounded-full px-2 py-0.5">
                    Indicador negativo
                  </span>
                )}
              </Label>
            )}
            {renderField(field)}
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">Enviar Formulario</Button>
    </form>
  );
}
