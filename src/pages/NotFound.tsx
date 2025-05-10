
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormTemplate } from "@/types/forms";
import { Card } from "@/components/ui/card";
import { Home, Search, RefreshCcw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const NotFound = () => {
  const location = useLocation();
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [isFormRoute, setIsFormRoute] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  
  useEffect(() => {
    console.error(
      "404 Error: Usuario intentó acceder a una ruta inexistente:",
      location.pathname
    );
    
    // Check if this is a form-related route
    const isFormPath = location.pathname.includes('/formularios/');
    setIsFormRoute(isFormPath);
    
    // Extract form ID if it exists in the URL
    if (isFormPath) {
      // Try to extract form ID from path like /formularios/rellenar/abc123 or /formularios/ver/abc123
      const pathParts = location.pathname.split('/');
      if (pathParts.length >= 3) {
        const potentialId = pathParts[pathParts.length - 1];
        if (potentialId && potentialId.length > 5) { // Simple check to ensure it looks like an ID
          setFormId(potentialId);
        }
      }
      
      // Load form templates for suggestions
      try {
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        console.log('NotFound: Templates disponibles:', storedTemplates.length);
        setFormTemplates(storedTemplates);
      } catch (err) {
        console.error('Error loading form templates:', err);
      }
    }
  }, [location.pathname]);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-4">
      <Card className="max-w-xl w-full p-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
            alt="Sepcon Logo" 
            className="h-16 mx-auto mb-6"
          />
          
          <h1 className="text-5xl font-bold text-brand-600 mb-4">404</h1>
          <p className="text-xl text-gray-700 mb-6">
            Lo sentimos, la página que estás buscando no existe.
          </p>
          
          {isFormRoute && (
            <Alert variant="destructive" className="mb-6 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Formulario no encontrado</AlertTitle>
              <AlertDescription>
                {formId ? 
                  `El formulario con ID ${formId} no se encontró en el sistema.` : 
                  "No se pudo encontrar el formulario solicitado."
                }
              </AlertDescription>
            </Alert>
          )}
          
          {isFormRoute && (
            <div className="mb-8">
              <p className="text-muted-foreground mb-4">
                Parece que estás buscando un formulario. 
                {formTemplates.length > 0 
                  ? ' Aquí tienes algunos formularios disponibles:'
                  : ' No hay formularios disponibles en este momento.'}
              </p>
              
              {formTemplates.length > 0 && (
                <div className="space-y-2 text-left border rounded-md p-4 mb-6">
                  {formTemplates.slice(0, 5).map((template) => (
                    <div key={template.id} className="flex justify-between items-center border-b pb-2">
                      <div className="flex-1">
                        <span className="font-medium">{template.name}</span>
                        <p className="text-xs text-muted-foreground">{template.id}</p>
                      </div>
                      <Button asChild size="sm" className="ml-2">
                        <Link to={`/formularios/rellenar/${template.id}`}>
                          <Search className="mr-2 h-4 w-4" /> Ver
                        </Link>
                      </Button>
                    </div>
                  ))}
                  
                  {formTemplates.length > 5 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Mostrando 5 de {formTemplates.length} formularios disponibles.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isFormRoute && (
              <Button onClick={handleRetry} variant="outline" className="flex items-center justify-center">
                <RefreshCcw className="mr-2 h-4 w-4" /> Reintentar
              </Button>
            )}
            
            <Button asChild className="bg-brand-600 hover:bg-brand-700">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" /> Volver al dashboard
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
