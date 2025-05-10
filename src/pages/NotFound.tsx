
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormTemplate } from "@/types/forms";
import { Card } from "@/components/ui/card";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [isFormRoute, setIsFormRoute] = useState(false);
  
  useEffect(() => {
    console.error(
      "404 Error: Usuario intentó acceder a una ruta inexistente:",
      location.pathname
    );
    
    // Check if this is a form-related route
    const isFormPath = location.pathname.includes('/formularios/');
    setIsFormRoute(isFormPath);
    
    if (isFormPath) {
      // Load form templates for suggestions
      try {
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        setFormTemplates(storedTemplates);
      } catch (err) {
        console.error('Error loading form templates:', err);
      }
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-4">
      <Card className="max-w-xl w-full p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-brand-600 mb-4">404</h1>
          <p className="text-xl text-gray-700 mb-6">
            Lo sentimos, la página que estás buscando no existe.
          </p>
          
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
                      <span className="font-medium">{template.name}</span>
                      <Button asChild size="sm" variant="outline">
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
          
          <Button asChild className="bg-brand-600 hover:bg-brand-700">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Volver al dashboard
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
