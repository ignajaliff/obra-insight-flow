
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, FileText, Eye, Link as LinkIcon } from 'lucide-react';
import { FormTemplate } from '@/types/forms';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';

interface FormTemplateListProps {
  templates: FormTemplate[];
  onEdit: (template: FormTemplate) => void;
  onDelete: (id: string) => void;
}

export function FormTemplateList({ templates, onEdit, onDelete }: FormTemplateListProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  const copyFormLink = (template: FormTemplate) => {
    const url = `${window.location.origin}/formularios/rellenar/${template.id}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Enlace copiado",
      description: "El enlace del formulario ha sido copiado al portapapeles."
    });
  };
  
  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (templateToDelete) {
      try {
        // Delete from Supabase
        const { error } = await supabase
          .from('form_templates')
          .delete()
          .eq('id', templateToDelete);
        
        if (error) {
          console.error('Error deleting form template:', error);
          toast({
            title: "Error",
            description: "No se pudo eliminar el formulario. Inténtelo de nuevo más tarde.",
            variant: "destructive"
          });
        } else {
          // Call the onDelete callback to update the UI
          onDelete(templateToDelete);
          toast({
            title: "Formulario eliminado",
            description: "El formulario ha sido eliminado correctamente."
          });
        }
      } catch (err) {
        console.error('Error in delete operation:', err);
        toast({
          title: "Error",
          description: "Ha ocurrido un error al eliminar el formulario.",
          variant: "destructive"
        });
      }
    }
    // Close the dialog and reset the template to delete
    setIsDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };
  
  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-md bg-muted/5">
        <FileText className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-xl font-medium mb-1">No hay formularios creados</h3>
        <p className="text-muted-foreground mb-4">
          Crea tu primer formulario para empezar a recopilar datos.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm font-medium text-muted-foreground">
                {template.fields.length} campos
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Actualizado: {new Date(template.updated_at).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="flex justify-between w-full">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/formularios/rellenar/${template.id}`}>
                    <Eye size={16} className="mr-2" />
                    Ver
                  </Link>
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => copyFormLink(template)}>
                  <LinkIcon size={16} className="mr-2" />
                  Copiar enlace
                </Button>
              </div>
              
              <div className="flex justify-between w-full mt-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(template)}>
                  <Edit size={16} className="mr-2" />
                  Editar
                </Button>
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDeleteClick(template.id)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Eliminar
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El formulario será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
