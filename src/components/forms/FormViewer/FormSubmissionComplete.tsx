
import React from 'react';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface FormSubmissionCompleteProps {
  template: FormTemplate;
  submissionData: FormSubmission;
}

export function FormSubmissionComplete({ template, submissionData }: FormSubmissionCompleteProps) {
  const downloadAsPDF = () => {
    const element = document.getElementById('form-pdf-content');
    if (!element) return;
    
    const opt = {
      margin: 10,
      filename: `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>¡Formulario enviado correctamente!</CardTitle>
        <CardDescription>
          Gracias por completar el formulario "{template.name}". 
          Tu respuesta ha sido registrada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div id="form-pdf-content" className="bg-white p-4 rounded-md">
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
                      className="max-h-32 mt-1" 
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
      <CardFooter className="flex justify-end">
        <Button onClick={downloadAsPDF} className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
