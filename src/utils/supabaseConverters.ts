
import { FormField, FormTemplate, ProjectMetadata } from "@/types/forms";

/**
 * Converts a FormTemplate to the format expected by Supabase
 */
export const convertTemplateToSupabase = (template: FormTemplate) => {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    fields: JSON.stringify(template.fields),
    created_at: template.created_at,
    updated_at: template.updated_at,
    public_url: template.public_url,
    project_metadata: template.projectMetadata ? JSON.stringify(template.projectMetadata) : null
  };
};

/**
 * Converts a Supabase template record to our FormTemplate type
 */
export const convertSupabaseToTemplate = (record: any): FormTemplate => {
  let fields: FormField[] = [];
  if (record.fields) {
    try {
      // Check if fields is already an array or if it's a JSON string
      fields = typeof record.fields === 'string' 
        ? JSON.parse(record.fields) 
        : Array.isArray(record.fields) 
          ? record.fields 
          : [];
    } catch (e) {
      console.error("Error parsing fields:", e);
    }
  }

  let projectMetadata: ProjectMetadata | undefined = undefined;
  if (record.project_metadata) {
    try {
      projectMetadata = typeof record.project_metadata === 'string'
        ? JSON.parse(record.project_metadata)
        : record.project_metadata;
    } catch (e) {
      console.error("Error parsing project_metadata:", e);
    }
  }

  return {
    id: record.id,
    name: record.name,
    description: record.description,
    fields: fields,
    created_at: record.created_at,
    updated_at: record.updated_at,
    public_url: record.public_url,
    projectMetadata: projectMetadata
  };
};

/**
 * Converts a list of form templates from Supabase to our FormTemplate type
 */
export const convertSupabaseTemplateList = (records: any[]): FormTemplate[] => {
  if (!records || !Array.isArray(records)) return [];
  
  return records.map(record => convertSupabaseToTemplate(record));
};
