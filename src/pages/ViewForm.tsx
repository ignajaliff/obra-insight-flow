import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormTemplate } from '@/types/forms';
import { FormViewer } from '@/components/forms/FormViewer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Copy, 
  Link as LinkIcon, 
  ClipboardList, 
  FileText, 
  Eye, 
  Share2, 
  RefreshCcw, 
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseToTemplate, convertSupabaseTemplateList } from '@/utils/supabaseConverters';

export default function ViewForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [availableTemplates, setAvailableTemplates] = useState<FormTemplate[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Load the template from Supabase
    const loadTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Intentando cargar template con ID:', templateId);
        
        // Get template from Supabase
        const { data, error } = await supabase
          .from('form_templates')
          .select('*')
          .eq('id', templateId)
          .single();
        
        if (error) {
          console.error('Error fetching template from Supabase:', error);
          throw error;
        }
        
        if (data) {
          console.log('Template encontrado:', data.name);
          const convertedTemplate = convertSupabaseToTemplate(data);
          setTemplate(convertedTemplate);
          setShareUrl(`${window.location.origin}/formularios/rellenar/${templateId}`);
        } else {
          console.error('Template no encontrado con ID:', templateId);
          
          // Check localStorage as fallback
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
          
          if (foundTemplate) {
            console.log('Template encontrado en localStorage:', foundTemplate.name);
            setTemplate(foundTemplate);
            setShareUrl(`${window.location.origin}/formularios/rellenar/${templateId}`);
          } else {
            setError('Formulario no encontrado');
          }
        }
        
        // Load available templates for suggestions
        const { data: availableData, error: availableError } = await supabase
          .from('form_templates')
          .select('id, name')
          .limit(5);
        
        if (!availableError && availableData && availableData.length > 0) {
          // Create simplified template objects with required fields
          const templates: FormTemplate[] = availableData.map(item => ({
            id: item.id,
            name: item.name,
            fields: [],
            created_at: '',
            updated_at: ''
          }));
          setAvailableTemplates(templates);
        } else {
          // Fallback to localStorage
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          setAvailableTemplates(storedTemplates);
        }
        
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Error al cargar el formulario');
        
        // Try fallback to localStorage
        try {
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
          
          if (foundTemplate) {
            setTemplate(foundTemplate);
            setShareUrl(`${window.location.origin}/formularios/rellenar/${templateId}`);
            setError(null);
          }
          
          setAvailableTemplates(storedTemplates);
        } catch (localErr) {
          console.error('Error with localStorage fallback:', localErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
  }, [templateId]);

  const copyFormLink = () => {
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Enlace copiado",
      description: "El enlace del formulario ha sido copiado al portapapeles."
    });
  };
  
  const openShareDialog = () => {
    setShareDialogOpen(true);
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Formulario: ${template?.name}`,
          text: `Por favor completa este formulario: ${template?.name}`,
          url: shareUrl
        });
        toast({
          title: "Compartido",
          description: "El formulario ha sido compartido exitosamente."
        });
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    } else {
      copyFormLink();
    }
  };
  
  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    
    // Try to load the template again from Supabase
    try {
      console.log('Reintentando cargar template con ID:', templateId);
      
      const { data, error } = await supabase
        .from('form_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (error) {
        console.error('Error fetching template from Supabase on retry:', error);
        throw error;
      }
      
      if (data) {
        console.log('Template encontrado en reintentar:', data.name);
        const convertedTemplate = convertSupabaseToTemplate(data);
        setTemplate(convertedTemplate);
        setShareUrl(`${window.location.origin}/formularios/rellenar/${templateId}`);
        setError(null);
      } else {
        console.error('Template no encontrado en reintentar con ID:', templateId);
        
        // Fallback to localStorage
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
        
        if (foundTemplate) {
          console.log('Template encontrado en localStorage (reintentar):', foundTemplate.name);
          setTemplate(foundTemplate);
          setShareUrl(`${window.location.origin}/formularios/rellenar/${templateId}`);
          setError(null);
        } else {
          setError('Formulario no encontrado');
        }
      }
    } catch (err) {
      console.error('Error reintentando cargar template:', err);
      setError('Error al cargar el formulario');
      
      // Fallback to localStorage
      try {
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
        
        if (foundTemplate) {
          setTemplate(foundTemplate);
          setShareUrl(`${window.location.origin}/formularios/rellenar/${templateId}`);
          setError(null);
        }
      } catch (localErr) {
        console.error('Error with localStorage fallback on retry:', localErr);
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 min-h-[300px]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#6EC1E4] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#2980b9]">Cargando formulario...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    const hasOtherForms = availableTemplates.length > 0;
    
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card className="p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <p className="text-lg">
              El formulario con ID <span className="font-mono text-sm bg-muted p-1 rounded">{templateId}</span> no se encontró en el sistema.
            </p>
            
            {hasOtherForms && (
              <div className="space-y-2">
                <p className="font-medium">Formularios disponibles:</p>
                <ul className="space-y-2">
                  {availableTemplates.map((t: FormTemplate) => (
                    <li key={t.id} className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{t.name}</p>
                          <p className="text-sm text-muted-foreground">{t.id}</p>
                        </div>
                        <Button asChild size="sm">
                          <Link to={`/formularios/ver/${t.id}`}>
                            Abrir
                          </Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button onClick={handleRetry} className="w-full sm:w-auto">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reintentar cargar
              </Button>
              
              <Button onClick={() => navigate('/formularios/mis-formularios')} variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a mis formularios
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  const hasProjectMetadata = template?.projectMetadata && Object.values(template?.projectMetadata).some(val => !!val);
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link to="/formularios/mis-formularios">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a mis formularios
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Ver formulario</h1>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={openShareDialog}>
              <Share2 className="mr-2 h-4 w-4" /> Compartir formulario
            </Button>
            
            <Button asChild variant="outline" size="sm">
              <Link to={`/formularios/rellenar/${templateId}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" /> Vista previa
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {template && (
        <Card>
          <Tabs defaultValue="preview">
            <TabsList className="w-full">
              <TabsTrigger value="preview" className="flex-1">Vista previa</TabsTrigger>
              {hasProjectMetadata && (
                <TabsTrigger value="metadata" className="flex-1">
                  <ClipboardList className="mr-2 h-4 w-4" /> Información del proyecto
                </TabsTrigger>
              )}
              <TabsTrigger value="share" className="flex-1">
                <LinkIcon className="mr-2 h-4 w-4" /> Compartir
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="preview">
              <FormViewer template={template} readOnly={true} />
            </TabsContent>
            
            {hasProjectMetadata && (
              <TabsContent value="metadata">
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Información del proyecto</h2>
                  <p className="text-muted-foreground text-sm">
                    Esta información no es visible para quienes completan el formulario, 
                    pero se envía junto con las respuestas.
                  </p>
                  
                  <div className="border rounded-md p-4 space-y-3">
                    {Object.entries(template.projectMetadata || {}).map(([key, value]) => {
                      if (!value) return null;
                      const readableKey = key
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, c => c.toUpperCase());
                      
                      return (
                        <div key={key} className="grid grid-cols-3">
                          <span className="font-medium">{readableKey}:</span>
                          <span className="col-span-2">{value}</span>
                        </div>
                      );
                    })}
                    
                    {!hasProjectMetadata && (
                      <p className="text-muted-foreground">No hay información adicional configurada.</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="share" className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Compartir formulario</h2>
              <p className="text-muted-foreground">
                Comparte este formulario con otras personas para que lo completen.
              </p>
              
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="share-url" className="text-sm font-medium">
                    Enlace del formulario
                  </label>
                  <div className="flex space-x-2">
                    <Input 
                      id="share-url"
                      value={shareUrl} 
                      readOnly 
                      className="flex-1" 
                    />
                    <Button onClick={copyFormLink} className="shrink-0">
                      <Copy className="mr-2 h-4 w-4" /> Copiar
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 flex flex-col space-y-2">
                  <h3 className="font-medium">Compartir directamente</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleShare} variant="outline">
                      <Share2 className="mr-2 h-4 w-4" /> Compartir
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Por favor completa este formulario: ${template.name} ${shareUrl}`)}`, '_blank')}
                    >
                      WhatsApp
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`mailto:?subject=${encodeURIComponent(`Formulario: ${template.name}`)}&body=${encodeURIComponent(`Por favor completa este formulario: ${shareUrl}`)}`, '_blank')}
                    >
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
      
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compartir formulario</DialogTitle>
            <DialogDescription>
              Comparte este enlace para que otras personas puedan completar el formulario.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyFormLink} type="submit" size="sm" className="px-3">
              <span className="sr-only">Copiar</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
            <Button 
              variant="outline"
              onClick={handleShare}
              className="mb-2 sm:mb-0"
            >
              <Share2 className="mr-2 h-4 w-4" /> Compartir
            </Button>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Por favor completa este formulario: ${template?.name} ${shareUrl}`)}`, '_blank')}
              >
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`mailto:?subject=${encodeURIComponent(`Formulario: ${template?.name}`)}&body=${encodeURIComponent(`Por favor completa este formulario: ${shareUrl}`)}`, '_blank')}
              >
                Email
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
