
import { FormTemplate } from '@/types/forms';
import { useToast } from '@/hooks/use-toast';

export function useFormValidation(template: FormTemplate) {
  const { toast } = useToast();
  
  const validateForm = (): boolean => {
    // Validate form name
    if (!template.name.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor ingresa un nombre para el formulario",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate that there are fields
    if (template.fields.length === 0) {
      toast({
        title: "Campos requeridos",
        description: "Por favor agrega al menos un campo al formulario",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  return { validateForm };
}
