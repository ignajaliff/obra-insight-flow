
import React, { useState } from 'react';
import { FormTemplate, FormField, FormSubmission } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';
import { FormFields } from './FormFields';
import { SubmitterInfoSection } from './SubmitterInfoSection';
import { AdditionalInfoSection } from './AdditionalInfoSection';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FormSubmissionFormProps {
  template: FormTemplate;
  readOnly?: boolean;
  webhookUrl?: string;
  setSubmissionComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmissionData: React.Dispatch<React.SetStateAction<FormSubmission | null>>;
  isMobile?: boolean;
}

export function FormSubmissionForm({ 
  template, 
  readOnly = false, 
  webhookUrl, 
  setSubmissionComplete, 
  setSubmissionData,
  isMobile = false
}: FormSubmissionFormProps) {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitterName, setSubmitterName] = useState('');
  const [submissionDate, setSubmissionDate] = useState<Date>(new Date());
  
  // States for standard section fields
  const [elaboradoPor, setElaboradoPor] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [supervisorSSMA, setSupervisorSSMA] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [firma, setFirma] = useState<string | null>(null);
  const [cargo, setCargo] = useState('');
  
  const handleChange = (field: FormField, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field.name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = template.fields.filter(
      field => field.required && !formValues[field.name]
    );
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos requeridos",
        description: `Por favor completa los siguientes campos: ${missingFields.map(f => f.label).join(", ")}`,
        variant: "destructive"
      });
      return;
    }
    
    if (!submitterName) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa tu nombre para enviar el formulario",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare submission data
      const submission: FormSubmission = {
        id: uuidv4(),
        templateId: template.id,
        values: {
          ...formValues,
          elaboradoPor,
          supervisor,
          supervisorSSMA,
          observaciones,
          firma,
          cargo
        },
        created_at: new Date().toISOString(),
        submissionDate: submissionDate.toISOString(),
        submitter_name: submitterName,
        template_name: template.name,
        projectMetadata: template.projectMetadata // Incluir los metadatos del proyecto
      };
      
      // Send to webhook with the new numbered format as plain text
      if (webhookUrl) {
        try {
          // Prepare data with numbered questions and answers
          let webhookContent = ``;
          
          // Add submitter name as "pregunta 0"
          webhookContent += `pregunta 0: Nombre del remitente\n`;
          webhookContent += `Respuesta 0: ${submitterName}\n\n`;
          
          // Add submission date
          webhookContent += `pregunta extra: Fecha de envío\n`;
          webhookContent += `Respuesta extra: ${format(submissionDate, 'dd/MM/yyyy', { locale: es })}\n\n`;
          
          // Add project metadata if available
          if (template.projectMetadata && Object.keys(template.projectMetadata).length > 0) {
            webhookContent += `== INFORMACIÓN DEL PROYECTO ==\n`;
            
            Object.entries(template.projectMetadata).forEach(([key, value]) => {
              if (value) {
                const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                webhookContent += `${readableKey}: ${value}\n`;
              }
            });
            
            webhookContent += `\n`;
          }
          
          // Add each field with its number
          template.fields.forEach((field, index) => {
            const questionNumber = index + 1;
            webhookContent += `pregunta ${questionNumber}: ${field.label}\n`;
            
            let responseValue = formValues[field.name];
            
            // Format the response value based on the field type
            if (field.type === 'date' && responseValue) {
              try {
                responseValue = new Date(responseValue).toLocaleDateString();
              } catch (e) {
                // If date parsing fails, use the original value
              }
            } else if (field.type === 'signature') {
              responseValue = responseValue ? "[Firma adjunta]" : "[Sin firma]";
            } else if (responseValue === undefined || responseValue === null) {
              responseValue = "";
            }
            
            webhookContent += `Respuesta ${questionNumber}: ${responseValue}\n\n`;
          });
          
          // Add additional information section as a separate block, not as questions
          webhookContent += `== INFORMACIÓN ADICIONAL ==\n`;
          webhookContent += `Elaborado por: ${elaboradoPor || ""}\n`;
          webhookContent += `Supervisor/Capataz: ${supervisor || ""}\n`;
          webhookContent += `Supervisor de SSMA: ${supervisorSSMA || ""}\n`;
          webhookContent += `Observaciones: ${observaciones || ""}\n`;
          webhookContent += `Cargo: ${cargo || ""}\n`;
          
          // Log the data being sent
          console.log('Sending data to webhook:', {
            content: webhookContent,
            firmaimg: firma || ""
          });
          
          // Add the signature as a separate field at the end of the text
          webhookContent += `\n\nfirmaimg: ${firma || ""}`;
          
          // Send webhook content as text/plain
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain',
            },
            body: webhookContent
          });
          
          if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status}`);
          }
          
          console.log('Webhook called successfully');
        } catch (webhookError) {
          console.error('Error sending data to webhook:', webhookError);
          toast({
            title: "Error",
            description: "No se pudo enviar la información al servidor. Por favor intenta nuevamente.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        console.warn('No webhook URL provided, submission will only be shown locally');
      }
      
      // Store submission for display only (not persisted)
      setSubmissionData(submission);
      setSubmissionComplete(true);
      
      toast({
        title: "Enviado correctamente",
        description: "Tu formulario ha sido enviado con éxito.",
      });
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el formulario. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <CardHeader className={cn("px-3 sm:px-6", isMobile && "p-4")}>
        <CardTitle className="text-xl md:text-2xl">{template.name}</CardTitle>
        {template.description && (
          <CardDescription>{template.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn("px-3 sm:px-6", isMobile && "p-4")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Submitter info */}
          <SubmitterInfoSection
            submitterName={submitterName}
            setSubmitterName={setSubmitterName}
            submissionDate={submissionDate}
            setSubmissionDate={setSubmissionDate}
            readOnly={readOnly}
            isMobile={isMobile}
          />
          
          <div className="border-t my-4"></div>
          
          {/* Form fields */}
          <FormFields 
            fields={template.fields}
            formValues={formValues}
            handleChange={handleChange}
            readOnly={readOnly}
            isMobile={isMobile}
          />
          
          {/* Standard form section with predefined fields */}
          <AdditionalInfoSection
            elaboradoPor={elaboradoPor}
            setElaboradoPor={setElaboradoPor}
            supervisor={supervisor}
            setSupervisor={setSupervisor}
            supervisorSSMA={supervisorSSMA}
            setSupervisorSSMA={setSupervisorSSMA}
            observaciones={observaciones}
            setObservaciones={setObservaciones}
            firma={firma}
            setFirma={setFirma}
            cargo={cargo}
            setCargo={setCargo}
            readOnly={readOnly}
          />
          
          {/* Submit button */}
          {!readOnly && (
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Enviando..." : "Enviar formulario"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </>
  );
}
