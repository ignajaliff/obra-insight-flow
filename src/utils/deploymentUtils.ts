
// Utility functions for handling deployment-specific configurations
export const getDeploymentEnvironment = () => {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isLovable = hostname.includes('lovable.app');
  const isCustomDomain = !isLocalhost && !isLovable;
  
  return {
    isLocalhost,
    isLovable,
    isCustomDomain,
    hostname
  };
};

export const shouldUseOfflineMode = () => {
  const env = getDeploymentEnvironment();
  // Force offline mode for custom domains to ensure forms always work
  return env.isCustomDomain;
};

export const getSupabaseConnectionStatus = async () => {
  try {
    const env = getDeploymentEnvironment();
    
    // For custom domains, default to offline mode
    if (env.isCustomDomain) {
      console.log("🏢 Detectado dominio personalizado - usando modo offline por defecto");
      return 'offline';
    }
    
    // For Lovable domains, try to connect
    const { supabase } = await import('@/integrations/supabase/client');
    const { data, error } = await supabase
      .from('form_templates')
      .select('count')
      .limit(1)
      .single();
    
    if (error) {
      console.warn("⚠️ Error de conexión Supabase:", error.message);
      return 'offline';
    }
    
    console.log("✅ Conexión Supabase establecida");
    return 'connected';
  } catch (error) {
    console.error("❌ Error crítico de conexión:", error);
    return 'offline';
  }
};

export const createFormUrl = (templateId: string) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/formularios/rellenar/${templateId}`;
};
