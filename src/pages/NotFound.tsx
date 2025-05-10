
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: Usuario intentó acceder a una ruta inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-6">
      <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
        <div className="mb-6">
          <h1 className="text-5xl font-bold text-[#e74c3c] mb-2">404</h1>
          <p className="text-2xl font-semibold text-gray-800 mb-2">Página no encontrada</p>
          <p className="text-base text-gray-600 mb-6">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full bg-brand-600 hover:bg-brand-700 flex items-center justify-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Volver al dashboard
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            Si crees que esto es un error, por favor contacta con soporte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
