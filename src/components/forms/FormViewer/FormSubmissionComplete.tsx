
import React from 'react';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download } from 'lucide-react';
import { CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    <>
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
            <p><strong>Fecha:</strong> {submissionData.submissionDate ? 
              format(new Date(submissionData.submissionDate), 'dd/MM/yyyy', { locale: es }) : 
              format(new Date(submissionData.created_at), 'dd/MM/yyyy', { locale: es })}</p>
          </div>
          
          {/* Template fields */}
          <div className="space-y-4">
            <h3 className="font-semibold border-b pb-1">Respuestas del formulario</h3>
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
                      <p>{new Date(submissionData.values[field.name]).toLocaleDateString('es-ES')}</p>
                    ) : <p className="text-muted-foreground">No especificado</p>
                  ) : (
                    <p>{submissionData.values[field.name] || <span className="text-muted-foreground">No especificado</span>}</p>
                  )
                )}
              </div>
            ))}
            
            {/* Standard fields section */}
            <h3 className="font-semibold border-b pb-1 mt-6">Información adicional</h3>
            
            <div className="border-b pb-2">
              <p className="font-medium">Elaborado por</p>
              <p>{submissionData.values.elaboradoPor || <span className="text-muted-foreground">No especificado</span>}</p>
            </div>
            
            <div className="border-b pb-2">
              <p className="font-medium">Supervisor/Capataz</p>
              <p>{submissionData.values.supervisor || <span className="text-muted-foreground">No especificado</span>}</p>
            </div>
            
            <div className="border-b pb-2">
              <p className="font-medium">Supervisor de SSMA</p>
              <p>{submissionData.values.supervisorSSMA || <span className="text-muted-foreground">No especificado</span>}</p>
            </div>
            
            <div className="border-b pb-2">
              <p className="font-medium">Observaciones</p>
              <p>{submissionData.values.observaciones || <span className="text-muted-foreground">No especificado</span>}</p>
            </div>
            
            <div className="border-b pb-2">
              <p className="font-medium">Firma</p>
              {submissionData.values.firma ? (
                <img 
                  src={submissionData.values.firma} 
                  alt="Firma" 
                  className="max-h-32 mt-1" 
                />
              ) : <p className="text-muted-foreground">No firmado</p>}
            </div>
            
            <div className="border-b pb-2">
              <p className="font-medium">Cargo</p>
              <p>{submissionData.values.cargo || <span className="text-muted-foreground">No especificado</span>}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={downloadAsPDF} className="flex items-center">
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </Button>
      </CardFooter>
    </>
  );
}
