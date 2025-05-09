
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
        
        // Mejorar la detección de dispositivos móviles con regex más completa
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
        const isMobileByAgent = mobileRegex.test(navigator.userAgent);
        
        // Agregamos touch events check
        const touchEnabled = ('ontouchstart' in window) || 
                            (navigator.maxTouchPoints > 0) || 
                            (navigator as any).msMaxTouchPoints > 0;
        
        console.log("Detección móvil mejorada:", { 
          isMobileByWidth, 
          isMobileByAgent,
          touchEnabled,
          width: window.innerWidth, 
          height: window.innerHeight,
          userAgent: navigator.userAgent 
        });
        
        // Si cualquiera de los tres indica que es móvil, lo consideramos móvil
        setIsMobile(isMobileByWidth || isMobileByAgent || touchEnabled);
      } else {
        // Si window no está disponible, asumimos que es móvil por defecto para ser más precavidos
        setIsMobile(true);
      }
    };
    
    // Verificar inmediatamente al montar el componente
    checkMobile();
    
    // Añadir event listener para cuando cambie el tamaño de la ventana
    window.addEventListener('resize', checkMobile);
    
    // Añadir event listener para cuando cambie la orientación en móviles
    window.addEventListener('orientationchange', checkMobile);
    
    // Limpiar
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
}
