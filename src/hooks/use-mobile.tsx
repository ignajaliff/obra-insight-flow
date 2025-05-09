
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Función para verificar si es un dispositivo móvil
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        // Utilizamos tanto el ancho de pantalla como userAgent para mejor detección
        const isMobileByWidth = window.innerWidth < MOBILE_BREAKPOINT;
        const isMobileByAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        console.log("Detección móvil:", { 
          isMobileByWidth, 
          isMobileByAgent, 
          width: window.innerWidth, 
          userAgent: navigator.userAgent 
        });
        
        // Si cualquiera de los dos indica que es móvil, lo consideramos móvil
        setIsMobile(isMobileByWidth || isMobileByAgent);
      }
    };
    
    // Verificar inmediatamente al montar el componente
    checkMobile();
    
    // Añadir event listener para cuando cambie el tamaño de la ventana
    window.addEventListener('resize', checkMobile);
    
    // Limpiar
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}
