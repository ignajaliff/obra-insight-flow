
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
    <Card className="text-center shadow-card border-accent/20">
      <CardHeader className="pb-2">
        <div className="mx-auto rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-display">¡Gracias por enviar el formulario!</CardTitle>
        <CardDescription className="text-base">
          Tu respuesta ha sido registrada correctamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div id="form-pdf-content" className="hidden">
          <h2 className="text-xl font-bold mb-4">{template.name}</h2>
          <div className="mb-4">
            <p><strong>Nombre:</strong> {submissionData.submitter_name}</p>
            {submissionData.empresa && <p><strong>Empresa:</strong> {submissionData.empresa}</p>}
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
