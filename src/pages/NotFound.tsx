
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

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
      <div className="text-center max-w-md p-8">
        <h1 className="text-5xl font-bold text-[#2980b9] mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">
          Lo sentimos, la página que estás buscando no existe.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
