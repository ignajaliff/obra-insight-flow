
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
import { CalendarIcon, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import SignatureCanvas from 'react-signature-canvas';
import { Link } from 'react-router-dom';

export default function FillForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitterName, setSubmitterName] = useState('');
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
        // Load from localStorage
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
        
        if (foundTemplate) {
          console.log("Template found:", foundTemplate);
          setTemplate(foundTemplate);
        } else {
          setError('Formulario no encontrado');
          console.error('Template not found:', templateId);
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
      // Create submission data
      const submissionData = {
        id: crypto.randomUUID(),
        templateId: template?.id,
        submissionDate: new Date().toISOString(),
        submitter_name: submitterName,
        template_name: template?.name,
        values: formValues,
        signatureImg: signatureImg,
        projectMetadata: template?.projectMetadata
      };
      
      console.log("Submitting form data:", submissionData);
      
      // Send data to webhook if provided
      if (webhookUrl) {
        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData),
          });
          
          if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
          }
          
          const responseData = await response.json();
          console.log("Webhook response:", responseData);
        } catch (webhookError) {
          console.error("Webhook error:", webhookError);
          // Continue even if webhook fails
        }
      }
      
      // Store in localStorage (for demonstration)
      const existingSubmissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      localStorage.setItem('formSubmissions', JSON.stringify([...existingSubmissions, submissionData]));
      
      toast({
        title: "Formulario enviado",
        description: "Tu respuesta ha sido registrada correctamente.",
      });
      
      // Show success screen
      setTemplate(null);
      setFormValues({});
      
      // Navigate back after submission
      setTimeout(() => {
        navigate('/formularios/mis-formularios');
      }, 2000);
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
        <Button asChild className="px-8">
          <Link to="/formularios/mis-formularios">Volver a mis formularios</Link>
        </Button>
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
                
                <div className="space-y-2 border-t pt-4">
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
