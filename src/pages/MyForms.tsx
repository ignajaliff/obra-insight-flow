import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormTemplate } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Plus, Copy, MoreVertical, Trash2, Eye, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function MyForms() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      
      // Intentar obtener desde Supabase primero
      const { data: supabaseTemplates, error } = await supabase
        .from('form_templates')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (supabaseTemplates && supabaseTemplates.length > 0) {
        // Si hay datos en Supabase, convertirlos al formato FormTemplate
        const convertedTemplates: FormTemplate[] = supabaseTemplates.map(template => ({
          id: template.id,
          name: template.name,
          fields: template.fields as unknown as FormTemplate['fields'],
          created_at: template.created_at,
          updated_at: template.updated_at,
          public_url: template.public_url || undefined,
          projectMetadata: template.projectmetadata as unknown as FormTemplate['projectMetadata']
        }));
        
        setTemplates(convertedTemplates);
      } else {
        // Como fallback, cargar del localStorage
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        
        // Si hay plantillas en localStorage pero no en Supabase, migrarlas a Supabase
        if (storedTemplates.length > 0) {
          for (const template of storedTemplates) {
            // Transformar la estructura para que coincida con la estructura de la tabla en Supabase
            const supabaseData = {
              id: template.id,
              name: template.name,
              fields: template.fields as any,
              created_at: template.created_at,
              updated_at: template.updated_at,
              public_url: template.public_url,
              projectmetadata: template.projectMetadata as any
            };
            
            await supabase
              .from('form_templates')
              .insert(supabaseData);
          }
          // Después de migrar, establecer los templates
          setTemplates(storedTemplates);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Fallar en silencio y usar localStorage como respaldo
      const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
      setTemplates(storedTemplates);
      
      toast({
        variant: "destructive",
        title: "Error al cargar formularios",
        description: "Se utilizaron datos locales como respaldo."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const copyFormLink = (template: FormTemplate) => {
    const url = `${window.location.origin}/formularios/rellenar/${template.id}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Enlace copiado",
      description: "El enlace del formulario ha sido copiado al portapapeles."
    });
  };
  
  const deleteTemplate = async (templateId: string) => {
    try {
      // Eliminar de Supabase
      const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) {
        throw error;
      }
      
      // También eliminar del localStorage como respaldo
      const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
      const updatedTemplates = storedTemplates.filter((t: FormTemplate) => t.id !== templateId);
      localStorage.setItem('formTemplates', JSON.stringify(updatedTemplates));
      
      // Actualizar el estado
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      
      toast({
        title: "Formulario eliminado",
        description: "El formulario ha sido eliminado correctamente."
      });
    } catch (error) {
      console.error('Error al eliminar formulario:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el formulario. Inténtalo de nuevo."
      });
    }
  };
  
  const formatProjectInfo = (template: FormTemplate) => {
    if (!template.projectMetadata) return "No hay información";
    
    const { projectName, companyName, location } = template.projectMetadata;
    const parts = [];
    
    if (projectName) parts.push(`Proyecto: ${projectName}`);
    if (companyName) parts.push(`Empresa: ${companyName}`);
    if (location) parts.push(`Ubicación: ${location}`);
    
    return parts.length > 0 ? parts.join('\n') : "No hay información";
  };
  
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando formularios...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Mis formularios</h1>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Buscar formularios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          
          <Button onClick={() => navigate('/formularios/crear')}>
            <Plus className="mr-2 h-4 w-4" /> Crear nuevo
          </Button>
        </div>
      </div>
      
      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">No hay formularios creados</h3>
              <p className="text-muted-foreground">
                Comienza creando tu primer formulario personalizado
              </p>
              <Button onClick={() => navigate('/formularios/crear')} className="mt-2">
                <Plus className="mr-2 h-4 w-4" /> Crear nuevo formulario
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Campos</TableHead>
                <TableHead>Información del proyecto</TableHead>
                <TableHead>Fecha de creación</TableHead>
                <TableHead>Última actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.fields.length}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="whitespace-pre-wrap max-w-xs">
                          {formatProjectInfo(template)}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {format(new Date(template.created_at), 'PPP', { locale: es })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(template.updated_at), 'PPP', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyFormLink(template)}
                      >
                        <Copy className="h-4 w-4 mr-2" /> Copiar enlace
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/formularios/rellenar/${template.id}`)}>
                            <Eye className="h-4 w-4 mr-2" /> Vista previa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteTemplate(template.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
