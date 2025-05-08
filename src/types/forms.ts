
export interface FormResponse {
  id: string;
  worker_name: string;
  form_type: string;
  form_type_id?: string;
  proyecto?: string;
  date: string;
  status: 'Todo positivo' | 'Contiene item negativo';
  document_link?: string;
  created_at?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  created_at: string;
  updated_at: string;
  public_url?: string;
  projectMetadata?: ProjectMetadata; // Nueva propiedad para metadatos del proyecto
}

export interface ProjectMetadata {
  projectId?: string;
  projectName?: string;
  location?: string;
  supervisor?: string;
  notes?: string;
  [key: string]: string | undefined; // Para campos dinámicos adicionales
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'checkbox' | 'select' | 'date' | 'textarea' | 'signature';
  required: boolean;
  options?: string[];
  isNegativeIndicator?: boolean;
  field_order: number;
}

export interface FormSubmission {
  id?: string;
  templateId: string;
  values: Record<string, any>;
  created_at?: string;
  proyecto?: string;
  submitter_name?: string; 
  template_name?: string;
  projectMetadata?: ProjectMetadata; // Añadimos los metadatos aquí también
}

// Add these new interfaces to fix the type errors
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  formCount?: number;
}

export interface FormType {
  id: string;
  name: string;
  description?: string;
  project_id: string;
}

export interface ProjectWithFormTypes extends Project {
  formTypes: FormType[];
}

export type FieldType = 'text' | 'number' | 'checkbox' | 'select' | 'date' | 'textarea' | 'signature';
