
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Usuario intentó acceder a una ruta inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-8">
        <h1 className="text-5xl font-bold text-brand-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">
          Lo sentimos, la página que estás buscando no existe.
        </p>
        <Button asChild className="bg-brand-600 hover:bg-brand-700">
          <a href="/">Volver al dashboard</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
