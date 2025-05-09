
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Function to check if device is mobile
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        try {
          // Use both screen width and userAgent for better detection
          const isMobileByWidth = window.innerWidth < MOBILE_BREAKPOINT;
          
          // Improve mobile detection with comprehensive regex
          const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
          const isMobileByAgent = mobileRegex.test(navigator.userAgent);
          
          // Add touch events check
          const touchEnabled = ('ontouchstart' in window) || 
                              (navigator.maxTouchPoints > 0) || 
                              (navigator as any).msMaxTouchPoints > 0;
          
          // Platform-specific checks for specific mobile devices
          const isPlatformMobile = /Android|iPhone|iPad|iPod/.test(navigator.platform) ||
                                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
          
          console.log("Mobile detection enhanced 3.0:", { 
            isMobileByWidth, 
            isMobileByAgent,
            touchEnabled,
            isPlatformMobile,
            width: window.innerWidth, 
            height: window.innerHeight,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            maxTouchPoints: navigator.maxTouchPoints
          });
          
          // If any detection indicates mobile, consider it mobile
          const isActuallyMobile = isMobileByWidth || isMobileByAgent || touchEnabled || isPlatformMobile;
          
          setIsMobile(isActuallyMobile);
        } catch (error) {
          console.error("Error in mobile device detection:", error);
          // If there's an error, assume it's mobile to be safe
          setIsMobile(true);
        }
      } else {
        // If window is not available, assume it's mobile by default to be cautious
        setIsMobile(true);
      }
    };
    
    // Check immediately when component mounts
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Add event listener for orientation change on mobile
    window.addEventListener('orientationchange', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return isMobile;
}
