
import React from 'react';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface FormSubmissionCompleteProps {
  template: FormTemplate;
  submissionData: FormSubmission;
}

export function FormSubmissionComplete({ template }: FormSubmissionCompleteProps) {
  return (
    <>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-4 rounded-full">
            <Check className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <CardTitle className="text-xl md:text-2xl mb-2">¡Formulario enviado correctamente!</CardTitle>
      </CardHeader>
      <CardContent className="text-center pb-8">
        <p className="text-muted-foreground">
          Gracias por completar el formulario "{template.name}". 
          Tu respuesta ha sido registrada.
        </p>
      </CardContent>
    </>
  );
}
