
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
import { Plus, Copy, MoreVertical, Pen, Trash2, Eye, Link } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function MyForms() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Load templates from localStorage (would be Supabase in production)
    const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
    setTemplates(storedTemplates);
  }, []);
  
  const copyFormLink = (template: FormTemplate) => {
    const url = `${window.location.origin}/formularios/rellenar/${template.id}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Enlace copiado",
      description: "El enlace del formulario ha sido copiado al portapapeles."
    });
  };
  
  const deleteTemplate = (templateId: string) => {
    // For demo purposes, just remove from local storage
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    localStorage.setItem('formTemplates', JSON.stringify(updatedTemplates));
    setTemplates(updatedTemplates);
    
    toast({
      title: "Formulario eliminado",
      description: "El formulario ha sido eliminado correctamente."
    });
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
                          <DropdownMenuItem onClick={() => navigate(`/formularios/ver/${template.id}`)}>
                            <Eye className="h-4 w-4 mr-2" /> Ver
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/formularios/editar/${template.id}`)}>
                            <Pen className="h-4 w-4 mr-2" /> Editar
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
