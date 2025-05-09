
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
} from '@/components/ui/dropdown-menu';
import { Plus, Copy, MoreVertical, Pen, Trash2, Eye, Link, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function MyForms() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Load templates from both localStorage and Supabase
    const loadTemplates = async () => {
      try {
        setLoading(true);
        
        // Load from localStorage first for compatibility
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        
        // Then try to get templates from Supabase
        const { data: supabaseTemplates, error } = await supabase
          .from('form_templates')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error loading templates from Supabase:", error);
          // If Supabase fails, just use localStorage
          setTemplates(storedTemplates);
        } else {
          console.log("Templates loaded from Supabase:", supabaseTemplates);
          
          // Process Supabase templates to ensure they match our FormTemplate type
          const processedTemplates = supabaseTemplates.map((template: any) => {
            return {
              id: template.id,
              name: template.name,
              description: template.description || '',
              fields: Array.isArray(template.fields) ? template.fields : [],
              created_at: template.created_at,
              updated_at: template.updated_at,
              public_url: template.public_url,
              is_active: template.is_active
            };
          });
          
          setTemplates(processedTemplates);
        }
      } catch (err) {
        console.error("Error loading templates:", err);
        // Fallback to localStorage
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        setTemplates(storedTemplates);
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplates();
  }, []);
  
  const copyFormLink = (template: FormTemplate) => {
    const url = `${window.location.origin}/formularios/rellenar/${template.id}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Enlace copiado",
      description: "El enlace del formulario ha sido copiado al portapapeles."
    });
  };
  
  const toggleActiveStatus = async (template: FormTemplate) => {
    try {
      const newStatus = template.is_active === false;
      
      // Update in Supabase
      const { error } = await supabase
        .from('form_templates')
        .update({ is_active: newStatus })
        .eq('id', template.id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setTemplates(templates.map(t => 
        t.id === template.id ? {...t, is_active: newStatus} : t
      ));
      
      toast({
        title: newStatus ? "Formulario activado" : "Formulario desactivado",
        description: newStatus 
          ? "El formulario ahora está disponible para ser completado." 
          : "El formulario ya no está disponible para ser completado."
      });
    } catch (error) {
      console.error("Error updating form status:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del formulario.",
        variant: "destructive"
      });
    }
  };
  
  const deleteTemplate = async (templateId: string) => {
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) {
        console.error("Error deleting from Supabase:", error);
        // Continue with local deletion even if Supabase fails
      }
      
      // Delete from local storage
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      localStorage.setItem('formTemplates', JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
      
      toast({
        title: "Formulario eliminado",
        description: "El formulario ha sido eliminado correctamente."
      });
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el formulario."
      });
    }
  };
  
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
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
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Cargando formularios...</span>
        </div>
      ) : templates.length === 0 ? (
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
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Campos</TableHead>
                <TableHead className="hidden md:table-cell">Fecha de creación</TableHead>
                <TableHead className="hidden md:table-cell">Última actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    {template.is_active !== false ? (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm">Activo</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                        <span className="text-sm">Inactivo</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{template.fields?.length || 0}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {template.created_at ? format(new Date(template.created_at), 'PPP', { locale: es }) : '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {template.updated_at ? format(new Date(template.updated_at), 'PPP', { locale: es }) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hidden sm:flex"
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
                          <DropdownMenuItem onClick={() => copyFormLink(template)} className="sm:hidden">
                            <Copy className="h-4 w-4 mr-2" /> Copiar enlace
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleActiveStatus(template)}>
                            {template.is_active === false ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" /> Activar
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" /> Desactivar
                              </>
                            )}
                          </DropdownMenuItem>
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
