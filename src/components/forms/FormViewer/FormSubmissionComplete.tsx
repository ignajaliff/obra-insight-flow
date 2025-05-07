
import React from 'react';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface FormSubmissionCompleteProps {
  template: FormTemplate;
  submissionData: FormSubmission;
}

export function FormSubmissionComplete({ template, submissionData }: FormSubmissionCompleteProps) {
  return (
    <Card className="text-center shadow-lg border-[#6EC1E4]/20 bg-white">
      <CardHeader className="pb-2">
        <div className="mx-auto rounded-full bg-[#e7f5fa] p-3 w-16 h-16 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-[#6EC1E4]" />
        </div>
        <CardTitle className="text-2xl font-display">¡Gracias por enviar el formulario!</CardTitle>
        <CardDescription className="text-base">
          Tu respuesta ha sido registrada correctamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div id="form-pdf-content" className="hidden">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
              alt="Sepcon Logo" 
              className="h-12"
            />
          </div>
          <h2 className="text-xl font-bold mb-4">{template.name}</h2>
          <div className="mb-4">
            <p><strong>Nombre:</strong> {submissionData.submitter_name}</p>
            {submissionData.proyecto && <p><strong>Proyecto:</strong> {submissionData.proyecto}</p>}
            <p><strong>Fecha:</strong> {new Date(submissionData.created_at || '').toLocaleDateString()}</p>
          </div>
          
          <div className="space-y-4">
            {template.fields.map((field) => (
              <div key={field.id} className="border-b pb-2">
                <p className="font-medium">{field.label}</p>
                {field.type === 'signature' ? (
                  submissionData.values[field.name] ? (
                    <img 
                      src={submissionData.values[field.name]} 
                      alt="Firma" 
                      className="max-h-28 mt-1" 
                    />
                  ) : <p className="text-muted-foreground">No firmado</p>
                ) : (
                  field.type === 'date' ? (
                    submissionData.values[field.name] ? (
                      <p>{new Date(submissionData.values[field.name]).toLocaleDateString()}</p>
                    ) : <p className="text-muted-foreground">No especificado</p>
                  ) : (
                    <p>{submissionData.values[field.name] || <span className="text-muted-foreground">No especificado</span>}</p>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
