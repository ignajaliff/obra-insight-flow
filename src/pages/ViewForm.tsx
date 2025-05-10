
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
  Share2 
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
import { supabase } from '@/integrations/supabase/client';

export default function ViewForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Cargar el template desde Supabase o localStorage como fallback
    const loadTemplate = async () => {
      try {
        console.info("Intentando cargar template con ID:", templateId);
        setLoading(true);
        
        // Primero intentar cargar desde Supabase
        try {
          const { data: templateData, error: supabaseError } = await supabase
            .from('form_templates')
            .select('*')
            .eq('id', templateId)
            .single();
          
          if (supabaseError) {
            console.error("Error fetching template from Supabase:", supabaseError);
            throw supabaseError;
          }
          
          if (templateData) {
            // Convertir los campos JSON a objetos
            const parsedTemplate: FormTemplate = {
              ...templateData,
              fields: Array.isArray(templateData.fields) 
                ? templateData.fields 
                : JSON.parse(templateData.fields as unknown as string),
              projectMetadata: templateData.project_metadata 
                ? (typeof templateData.project_metadata === 'string' 
                  ? JSON.parse(templateData.project_metadata) 
                  : templateData.project_metadata)
                : {}
            };
            
            setTemplate(parsedTemplate);
            setShareUrl(`${window.location.origin}/formularios/rellenar/${templateId}`);
            setLoading(false);
            return;
          }
        } catch (supabaseError) {
          // Si hay un error en Supabase, continuamos con localStorage
          console.error("Error loading template from Supabase:", supabaseError);
        }
        
        // Fallback a localStorage
        try {
          const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
          const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
          
          if (foundTemplate) {
            setTemplate(foundTemplate);
            setShareUrl(`${window.location.origin}/formularios/rellenar/${templateId}`);
          } else {
            setError('Formulario no encontrado');
          }
        } catch (localStorageError) {
          console.error('Error loading template from localStorage:', localStorageError);
          setError('Error al cargar el formulario');
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-4 border-[#6EC1E4] border-solid rounded-full animate-spin"></div>
          <p className="text-lg">Cargando formulario...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-6">
        <div className="text-destructive text-2xl font-medium text-center">{error}</div>
        <p className="text-muted-foreground text-center">El formulario que estás buscando no existe o no está disponible.</p>
        <Button asChild variant="default">
          <Link to="/formularios/mis-formularios">Volver a mis formularios</Link>
        </Button>
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
