
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuario intentó acceder a una ruta inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc]">
      <div className="text-center max-w-md p-8 bg-white/80 rounded-lg shadow-sm backdrop-blur-sm">
        <h1 className="text-6xl font-bold text-[#2980b9] mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">
          Lo sentimos, la página que estás buscando no existe.
        </p>
        <img 
          src="/lovable-uploads/bac1af75-f52d-4155-95c6-dbe3fdf82b00.png" 
          alt="404 Error" 
          className="w-48 h-48 mx-auto mb-6 opacity-50" 
        />
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" /> Ir al inicio
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/formularios/mis-formularios">
              <ArrowLeft className="mr-2 h-4 w-4" /> Mis formularios
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
