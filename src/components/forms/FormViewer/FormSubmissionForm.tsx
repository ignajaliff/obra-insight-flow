
import React, { useState } from 'react';
import { FormTemplate, FormField, FormSubmission } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';
import { FormFields } from './FormFields';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { SignatureField } from '../SignatureField';

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
  const [submissionDate, setSubmissionDate] = useState<Date>(new Date());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
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
      setConnectionError(null);
      console.log("📤 Iniciando envío desde FormViewer...");
      
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
        projectMetadata: template.projectMetadata
      };
      
      console.log("📋 Datos preparados:", {
        templateName: template.name,
        submitterName,
        fieldsCount: Object.keys(formValues).length
      });
      
      // Send to webhook with improved error handling
      if (webhookUrl) {
        try {
          console.log("🌐 Enviando al webhook:", webhookUrl);
          
          // Prepare data with numbered questions and answers
          let webhookContent = ``;
          
          // Add project metadata if available
          if (template.projectMetadata && Object.keys(template.projectMetadata).length > 0) {
            webhookContent += `== INFORMACIÓN DEL PROYECTO (No visible para el usuario) ==\n`;
            webhookContent += `NombreFormulario: ${template.name}\n`;
            
            Object.entries(template.projectMetadata).forEach(([key, value]) => {
              if (value) {
                const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                webhookContent += `${readableKey}: ${value}\n`;
              }
            });
            webhookContent += `\n`;
          }
          
          // Add submitter name as "pregunta 0"
          webhookContent += `pregunta 0: Nombre del remitente\n`;
          webhookContent += `Respuesta 0: ${submitterName}\n\n`;
          
          // Add submission date
          webhookContent += `pregunta extra: Fecha de envío\n`;
          webhookContent += `Respuesta extra: ${format(submissionDate, 'dd/MM/yyyy', { locale: es })}\n\n`;
          
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
                console.warn("⚠️ Error formateando fecha:", e);
              }
            } else if (field.type === 'signature') {
              responseValue = responseValue ? "[Firma adjunta]" : "[Sin firma]";
            } else if (responseValue === undefined || responseValue === null) {
              responseValue = "";
            }
            
            webhookContent += `Respuesta ${questionNumber}: ${responseValue}\n\n`;
          });
          
          // Add additional information section
          webhookContent += `== INFORMACIÓN ADICIONAL ==\n`;
          webhookContent += `Elaborado por: ${elaboradoPor || ""}\n`;
          webhookContent += `Supervisor/Capataz: ${supervisor || ""}\n`;
          webhookContent += `Supervisor de SSMA: ${supervisorSSMA || ""}\n`;
          webhookContent += `Observaciones: ${observaciones || ""}\n`;
          webhookContent += `Cargo: ${cargo || ""}\n`;
          
          // Attempt webhook submission with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain',
            },
            body: webhookContent + `\n\nfirmaimg: ${firma || ""}`,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          console.log("✅ Webhook enviado exitosamente");
        } catch (webhookError) {
          console.error('❌ Error con webhook:', webhookError);
          
          let errorMessage = "Error de conexión con el servidor";
          if (webhookError instanceof Error) {
            if (webhookError.name === 'AbortError') {
              errorMessage = "Tiempo de conexión agotado";
            } else if (webhookError.message.includes('fetch')) {
              errorMessage = "No se pudo conectar al servidor";
            } else {
              errorMessage = webhookError.message;
            }
          }
          
          setConnectionError(errorMessage);
          
          toast({
            title: "Advertencia",
            description: "El formulario se guardó localmente pero no se pudo enviar al servidor.",
            variant: "destructive"
          });
          
          // Continue with local submission
        }
      } else {
        console.warn('⚠️ No hay webhook URL configurada');
      }
      
      // Store submission for display
      setSubmissionData(submission);
      setSubmissionComplete(true);
      
      if (!connectionError) {
        toast({
          title: "Enviado correctamente",
          description: "Tu formulario ha sido enviado con éxito.",
        });
      }
      
    } catch (error) {
      console.error("❌ Error general en envío:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar el formulario. Inténtalo de nuevo.",
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
        {connectionError && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-yellow-800 text-sm">{connectionError}</span>
          </div>
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
              <Label htmlFor="submission-date">Fecha de envío</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="submission-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !submissionDate && "text-muted-foreground"
                    )}
                    disabled={readOnly}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {submissionDate ? format(submissionDate, 'dd/MM/yyyy', { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={submissionDate}
                    onSelect={(date) => setSubmissionDate(date || new Date())}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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
          
          {/* Standard form section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Información adicional</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="elaborado-por">Elaborado por</Label>
                <Input
                  id="elaborado-por"
                  value={elaboradoPor}
                  onChange={(e) => setElaboradoPor(e.target.value)}
                  placeholder="Nombre de quien elaboró"
                  disabled={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="supervisor">Supervisor/Capataz</Label>
                <Input
                  id="supervisor"
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  placeholder="Nombre del supervisor o capataz"
                  disabled={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="supervisor-ssma">Supervisor de SSMA</Label>
                <Input
                  id="supervisor-ssma"
                  value={supervisorSSMA}
                  onChange={(e) => setSupervisorSSMA(e.target.value)}
                  placeholder="Nombre del supervisor de SSMA"
                  disabled={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ingrese sus observaciones"
                  disabled={readOnly}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="firma">Firma</Label>
                <SignatureField
                  id="firma"
                  value={firma}
                  onChange={setFirma}
                  readOnly={readOnly}
                />
              </div>
              
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ingrese su cargo"
                  disabled={readOnly}
                />
              </div>
            </div>
          </div>
          
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
