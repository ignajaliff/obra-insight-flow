
import React, { useState } from 'react';
import { FormTemplate, FormField, FormSubmission } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';
import { FormFields } from './FormFields';
import { Label } from '@/components/ui/label';

interface FormSubmissionFormProps {
  template: FormTemplate;
  readOnly?: boolean;
  webhookUrl?: string;
  setSubmissionComplete: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmissionData: React.Dispatch<React.SetStateAction<FormSubmission | null>>;
}

export function FormSubmissionForm({ 
  template, 
  readOnly = false, 
  webhookUrl, 
  setSubmissionComplete, 
  setSubmissionData 
}: FormSubmissionFormProps) {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitterName, setSubmitterName] = useState('');
  const [proyecto, setProyecto] = useState('');
  
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
        values: formValues,
        created_at: new Date().toISOString(),
        proyecto: proyecto || undefined,
        submitter_name: submitterName,
        template_name: template.name
      };
      
      // For demo: save to localStorage
      const existingSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      localStorage.setItem('formSubmissions', JSON.stringify([...existingSubmissions, submission]));
      
      // Send to webhook with the new format
      if (webhookUrl) {
        try {
          // Prepare data in the required format
          const webhookData = {
            title: template.name,
            fields: template.fields.map(field => {
              const fieldData: {
                label: string;
                type: string;
                value: any;
                options?: string[];
              } = {
                label: field.label,
                type: field.type,
                value: formValues[field.name] || ""
              };
              
              // Add options array if the field type is select
              if (field.type === 'select' && field.options) {
                fieldData.options = field.options;
              }
              
              return fieldData;
            })
          };
          
          console.log('Sending data to webhook:', webhookData);
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
          });
          console.log('Webhook called successfully');
        } catch (webhookError) {
          console.error('Error sending data to webhook:', webhookError);
          // Continue with local submission even if webhook fails
        }
      }
      
      // Store submission for potential download
      setSubmissionData(submission);
      setSubmissionComplete(true);
      
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
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        {template.description && (
          <CardDescription>{template.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Submitter info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="submitter-name">Tu nombre</Label>
              <Input
                id="submitter-name"
                value={submitterName}
                onChange={(e) => setSubmitterName(e.target.value)}
                placeholder="Escribe tu nombre completo"
                required
                disabled={readOnly}
              />
            </div>
            
            <div>
              <Label htmlFor="proyecto">Proyecto (opcional)</Label>
              <Input
                id="proyecto"
                value={proyecto}
                onChange={(e) => setProyecto(e.target.value)}
                placeholder="Nombre del proyecto"
                disabled={readOnly}
              />
            </div>
          </div>
          
          <div className="border-t my-4"></div>
          
          {/* Form fields */}
          <FormFields 
            fields={template.fields}
            formValues={formValues}
            handleChange={handleChange}
            readOnly={readOnly}
          />
          
          {/* Submit button */}
          {!readOnly && (
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar formulario"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </>
  );
}
