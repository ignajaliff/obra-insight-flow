import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormField, FormTemplate } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import SignatureCanvas from 'react-signature-canvas';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function FillForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitterName, setSubmitterName] = useState('');
  
  // States for standard section fields - Información adicional
  const [elaboradoPor, setElaboradoPor] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [supervisorSSMA, setSupervisorSSMA] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cargo, setCargo] = useState('');
  
  // Signature state
  const [signatureImg, setSignatureImg] = useState<string | null>(null);
  const [signatureRef, setSignatureRef] = useState<SignatureCanvas | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // This will be the webhook URL where form submissions are sent
  const webhookUrl = "https://n8n-n8n.qqtfab.easypanel.host/webhook-test/041274fe-3d47-4cdf-b4c2-114b661ef850";
  
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId) {
        setError('ID de formulario no proporcionado');
        setLoading(false);
        return;
      }

      try {
        // First try to load from Supabase
        const { data: supabaseTemplates, error } = await supabase
          .from('form_templates')
          .select('*')
          .eq('id', templateId)
          .single();
        
        if (error) {
          console.error("Error fetching template from Supabase:", error);
          
          // If Supabase fails, try localStorage as fallback
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
          
          if (foundTemplate) {
            console.log("Template found in localStorage:", foundTemplate);
            setTemplate(foundTemplate);
          } else {
            setError('Formulario no encontrado');
            console.error('Template not found in localStorage:', templateId);
          }
        } else if (supabaseTemplates) {
          console.log("Template found in Supabase:", supabaseTemplates);
          
          // Convert Supabase response to FormTemplate format - Fix: projectmetadata to projectMetadata
          const convertedTemplate: FormTemplate = {
            id: supabaseTemplates.id,
            name: supabaseTemplates.name,
            fields: supabaseTemplates.fields as unknown as FormTemplate['fields'],
            created_at: supabaseTemplates.created_at,
            updated_at: supabaseTemplates.updated_at,
            public_url: supabaseTemplates.public_url || undefined,
            projectMetadata: supabaseTemplates.projectmetadata as unknown as FormTemplate['projectMetadata']
          };
          
          setTemplate(convertedTemplate);
        } else {
          setError('Formulario no encontrado');
          console.error('Template not found in Supabase:', templateId);
        }
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Error al cargar el formulario');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
  }, [templateId]);
  
  const handleFieldChange = (field: FormField, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field.name]: value
    }));
  };
  
  const clearSignature = () => {
    if (signatureRef) {
      signatureRef.clear();
      setSignatureImg(null);
    }
  };
  
  const saveSignature = () => {
    if (signatureRef && !signatureRef.isEmpty()) {
      const dataUrl = signatureRef.toDataURL('image/png');
      setSignatureImg(dataUrl);
    } else {
      toast({
        title: "Firma vacía",
        description: "Por favor proporciona una firma antes de guardar",
        variant: "destructive"
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submitterName.trim()) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa tu nombre para enviar el formulario",
        variant: "destructive"
      });
      return;
    }
    
    // Check required fields
    const missingFields = template?.fields
      .filter(field => field.required && !formValues[field.name])
      .map(field => field.label);
    
    if (missingFields && missingFields.length > 0) {
      toast({
        title: "Campos requeridos",
        description: `Por favor completa los siguientes campos: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create submission data - include the standard fields
      const submissionData = {
        id: crypto.randomUUID(),
        templateId: template?.id,
        submissionDate: new Date().toISOString(),
        submitter_name: submitterName,
        template_name: template?.name,
        values: {
          ...formValues,
          // Include the standard fields
          elaboradoPor,
          supervisor,
          supervisorSSMA,
          observaciones,
          firma: signatureImg,
          cargo
        },
        projectMetadata: template?.projectMetadata
      };
      
      console.log("Submitting form data:", submissionData);
      
      // Send data to webhook if provided
      if (webhookUrl) {
        try {
          // Prepare data with numbered questions and answers
          let webhookContent = ``;
          
          // Add submitter name as "pregunta 0"
          webhookContent += `pregunta 0: Nombre del remitente\n`;
          webhookContent += `Respuesta 0: ${submitterName}\n\n`;
          
          // Add submission date
          webhookContent += `pregunta extra: Fecha de envío\n`;
          webhookContent += `Respuesta extra: ${format(new Date(), 'dd/MM/yyyy', { locale: es })}\n\n`;
          
          // Add project metadata if available
          if (template?.projectMetadata && Object.keys(template.projectMetadata).length > 0) {
            webhookContent += `== INFORMACIÓN DEL PROYECTO (No visible para el usuario) ==\n`;
            
            // Add form name to the project metadata section
            webhookContent += `NombreFormulario: ${template.name}\n`;
            
            Object.entries(template.projectMetadata).forEach(([key, value]) => {
              if (value) {
                const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                webhookContent += `${readableKey}: ${value}\n`;
              }
            });
            
            webhookContent += `\n`;
          }
          
          // Add each field with its number
          template?.fields.forEach((field, index) => {
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
            } else if (responseValue === undefined || responseValue === null) {
              responseValue = "";
            }
            
            webhookContent += `Respuesta ${questionNumber}: ${responseValue}\n\n`;
          });
          
          // Add additional information section as a separate block
          webhookContent += `== INFORMACIÓN ADICIONAL ==\n`;
          webhookContent += `Elaborado por: ${elaboradoPor || ""}\n`;
          webhookContent += `Supervisor/Capataz: ${supervisor || ""}\n`;
          webhookContent += `Supervisor de SSMA: ${supervisorSSMA || ""}\n`;
          webhookContent += `Observaciones: ${observaciones || ""}\n`;
          webhookContent += `Cargo: ${cargo || ""}\n`;
          webhookContent += `Firma: ${signatureImg ? "[Firma adjunta]" : "[Sin firma]"}\n`;
          
          // Log the data being sent
          console.log('Sending data to webhook:', webhookContent);
          
          // Send webhook content as text/plain and signature as PNG in base64
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain',
            },
            body: webhookContent + `\n\nfirmaimg: ${signatureImg || ""}`
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
          setSubmitting(false);
          return;
        }
      }
      
      // Store in localStorage (for demonstration)
      const existingSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      localStorage.setItem('formSubmissions', JSON.stringify([...existingSubmissions, submissionData]));
      
      toast({
        title: "Formulario enviado",
        description: "Tu respuesta ha sido registrada correctamente.",
      });
      
      // Show success screen instead of redirecting
      setSubmitted(true);
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el formulario. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-[#2980b9] animate-spin" />
          <p className="text-lg font-medium text-[#2980b9]">Cargando formulario...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-8 space-y-6">
        <div className="text-[#e74c3c] text-3xl font-bold mb-2">Formulario no encontrado</div>
        <p className="text-[#34495e] text-center mb-6">
          El formulario que estás buscando no existe o ha sido eliminado.
        </p>
        <p className="text-[#7f8c8d] text-center">
          Si crees que esto es un error, contacta con el administrador.
        </p>
      </div>
    );
  }

  // Success screen - shown after successful submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-8">
            <img 
              src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
              alt="Logo" 
              className="h-16"
            />
          </div>
          
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                ¡Formulario enviado correctamente!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-lg text-gray-700">
                Gracias por completar el formulario "{template?.name}".
              </p>
              <p className="text-gray-600">
                Tu respuesta ha sido registrada y enviada exitosamente.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <p className="text-green-800 font-medium">
                  ✓ Formulario procesado
                </p>
                <p className="text-green-700 text-sm">
                  Fecha de envío: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
            alt="Logo" 
            className="h-16"
          />
        </div>
        
        {template && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">{template.name}</CardTitle>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="submitter-name">Tu nombre completo</Label>
                  <Input
                    id="submitter-name"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="Ingresa tu nombre completo"
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  {template.fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      
                      {/* Field rendering based on type */}
                      {field.type === 'text' && (
                        <Input
                          id={field.id}
                          value={formValues[field.name] || ''}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          required={field.required}
                        />
                      )}
                      
                      {field.type === 'textarea' && (
                        <Textarea
                          id={field.id}
                          value={formValues[field.name] || ''}
                          onChange={(e) => handleFieldChange(field, e.target.value)}
                          required={field.required}
                          rows={3}
                        />
                      )}
                      
                      {field.type === 'select' && (
                        <Select
                          value={formValues[field.name] || ''}
                          onValueChange={(value) => handleFieldChange(field, value)}
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
                      )}
                      
                      {field.type === 'date' && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id={field.id}
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formValues[field.name] && "text-muted-foreground"
                              )}
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
                              onSelect={(date) => handleFieldChange(field, date?.toISOString())}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")} 
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Standard Information Section - Always present */}
                <div className="mt-8 border-t pt-4">
                  <h3 className="text-lg font-medium mb-4">Información adicional</h3>
                  
                  <div className="space-y-4">
                    {/* Elaborado por */}
                    <div>
                      <Label htmlFor="elaborado-por">Elaborado por</Label>
                      <Input
                        id="elaborado-por"
                        value={elaboradoPor}
                        onChange={(e) => setElaboradoPor(e.target.value)}
                        placeholder="Nombre de quien elaboró"
                      />
                    </div>
                    
                    {/* Supervisor/Capataz */}
                    <div>
                      <Label htmlFor="supervisor">Supervisor/Capataz</Label>
                      <Input
                        id="supervisor"
                        value={supervisor}
                        onChange={(e) => setSupervisor(e.target.value)}
                        placeholder="Nombre del supervisor o capataz"
                      />
                    </div>
                    
                    {/* Supervisor de SSMA */}
                    <div>
                      <Label htmlFor="supervisor-ssma">Supervisor de SSMA</Label>
                      <Input
                        id="supervisor-ssma"
                        value={supervisorSSMA}
                        onChange={(e) => setSupervisorSSMA(e.target.value)}
                        placeholder="Nombre del supervisor de SSMA"
                      />
                    </div>
                    
                    {/* Observaciones */}
                    <div>
                      <Label htmlFor="observaciones">Observaciones</Label>
                      <Textarea
                        id="observaciones"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Ingrese sus observaciones"
                        rows={3}
                      />
                    </div>
                    
                    {/* Cargo */}
                    <div>
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        value={cargo}
                        onChange={(e) => setCargo(e.target.value)}
                        placeholder="Ingrese su cargo"
                      />
                    </div>
                    
                    {/* Firma */}
                    <div>
                      <Label>Firma</Label>
                      <div className="border rounded-md p-2">
                        {signatureImg ? (
                          <div className="text-center">
                            <img src={signatureImg} alt="Firma" className="mx-auto max-h-40" />
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setSignatureImg(null)}
                            >
                              Borrar firma
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="border rounded-md bg-white">
                              <SignatureCanvas
                                ref={(ref) => setSignatureRef(ref)}
                                canvasProps={{
                                  className: "w-full h-40"
                                }}
                              />
                            </div>
                            <div className="flex justify-between mt-2">
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={clearSignature}
                              >
                                Borrar
                              </Button>
                              <Button 
                                type="button" 
                                size="sm"
                                onClick={saveSignature}
                              >
                                Guardar firma
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end border-t pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Enviando...
                    </>
                  ) : (
                    'Enviar formulario'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
