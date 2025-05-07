
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormTemplate, FormField, FormSubmission } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { SignatureField } from './SignatureField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import html2pdf from 'html2pdf.js';

interface FormViewerProps {
  template?: FormTemplate;
  readOnly?: boolean;
  webhookUrl?: string;
}

export function FormViewer({ template, readOnly = false, webhookUrl }: FormViewerProps) {
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitterName, setSubmitterName] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [submissionData, setSubmissionData] = useState<FormSubmission | null>(null);
  
  if (!template) {
    return <div className="text-center p-8">Formulario no encontrado</div>;
  }
  
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
      
      // Send to webhook
      if (webhookUrl) {
        try {
          console.log('Sending data to webhook:', submission);
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(submission)
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
  
  const downloadAsPDF = () => {
    if (!submissionData) return;
    
    const element = document.getElementById('form-pdf-content');
    if (!element) return;
    
    const opt = {
      margin:       10,
      filename:     `${template.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };
  
  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            disabled={readOnly || submissionComplete}
            required={field.required}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={formValues[field.name] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            disabled={readOnly || submissionComplete}
            required={field.required}
            rows={3}
          />
        );
        
      case 'select':
        return (
          <Select
            value={formValues[field.name] || ''}
            onValueChange={(value) => handleChange(field, value)}
            disabled={readOnly || submissionComplete}
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={field.id}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formValues[field.name] && "text-muted-foreground"
                )}
                disabled={readOnly || submissionComplete}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formValues[field.name] ? (
                  format(new Date(formValues[field.name]), 'PP', { locale: es })
                ) : (
                  <span>Seleccionar fecha...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formValues[field.name] ? new Date(formValues[field.name]) : undefined}
                onSelect={(date) => handleChange(field, date?.toISOString())}
                initialFocus
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
            readOnly={readOnly || submissionComplete}
          />
        );
        
      default:
        return null;
    }
  };
  
  if (submissionComplete && submissionData) {
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
              {submissionData.proyecto && <p><strong>Proyecto:</strong> {submissionData.proyecto}</p>}
              <p><strong>Fecha:</strong> {new Date(submissionData.created_at).toLocaleDateString()}</p>
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
  
  return (
    <Card>
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
                disabled={readOnly || submissionComplete}
              />
            </div>
            
            <div>
              <Label htmlFor="proyecto">Proyecto (opcional)</Label>
              <Input
                id="proyecto"
                value={proyecto}
                onChange={(e) => setProyecto(e.target.value)}
                placeholder="Nombre del proyecto"
                disabled={readOnly || submissionComplete}
              />
            </div>
          </div>
          
          <div className="border-t my-4"></div>
          
          {/* Form fields */}
          <div className="space-y-4">
            {template.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          
          {/* Submit button */}
          {!readOnly && !submissionComplete && (
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar formulario"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
