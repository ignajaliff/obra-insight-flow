
// Enhanced offline storage utilities for forms
export interface OfflineFormTemplate {
  id: string;
  name: string;
  fields: any[];
  created_at: string;
  updated_at: string;
  public_url?: string;
  projectMetadata?: any;
  description?: string;
}

export interface OfflineFormSubmission {
  id: string;
  templateId: string;
  values: Record<string, any>;
  created_at: string;
  submissionDate: string;
  submitter_name: string;
  template_name: string;
  projectMetadata?: any;
}

export const saveFormTemplateOffline = (template: OfflineFormTemplate): void => {
  try {
    const existingTemplates = getOfflineFormTemplates();
    const updatedTemplates = existingTemplates.filter(t => t.id !== template.id);
    updatedTemplates.push(template);
    localStorage.setItem('formTemplates', JSON.stringify(updatedTemplates));
    console.log("💾 Plantilla guardada offline:", template.name);
  } catch (error) {
    console.error("❌ Error guardando plantilla offline:", error);
  }
};

export const getOfflineFormTemplates = (): OfflineFormTemplate[] => {
  try {
    const templates = localStorage.getItem('formTemplates');
    return templates ? JSON.parse(templates) : [];
  } catch (error) {
    console.error("❌ Error leyendo plantillas offline:", error);
    return [];
  }
};

export const getOfflineFormTemplate = (id: string): OfflineFormTemplate | null => {
  try {
    const templates = getOfflineFormTemplates();
    return templates.find(t => t.id === id) || null;
  } catch (error) {
    console.error("❌ Error obteniendo plantilla offline:", error);
    return null;
  }
};

export const saveFormSubmissionOffline = (submission: OfflineFormSubmission): void => {
  try {
    const existingSubmissions = getOfflineFormSubmissions();
    existingSubmissions.push(submission);
    localStorage.setItem('formSubmissions', JSON.stringify(existingSubmissions));
    console.log("💾 Respuesta guardada offline:", submission.template_name);
  } catch (error) {
    console.error("❌ Error guardando respuesta offline:", error);
  }
};

export const getOfflineFormSubmissions = (): OfflineFormSubmission[] => {
  try {
    const submissions = localStorage.getItem('formSubmissions');
    return submissions ? JSON.parse(submissions) : [];
  } catch (error) {
    console.error("❌ Error leyendo respuestas offline:", error);
    return [];
  }
};

export const syncOfflineDataWithSupabase = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const templates = getOfflineFormTemplates();
    
    for (const template of templates) {
      try {
        const { error } = await supabase
          .from('form_templates')
          .upsert({
            id: template.id,
            name: template.name,
            fields: template.fields,
            projectmetadata: template.projectMetadata,
            public_url: template.public_url,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.warn("⚠️ Error sincronizando plantilla:", template.name, error);
        } else {
          console.log("✅ Plantilla sincronizada:", template.name);
        }
      } catch (syncError) {
        console.error("❌ Error en sincronización:", syncError);
      }
    }
  } catch (error) {
    console.error("❌ Error general de sincronización:", error);
  }
};
