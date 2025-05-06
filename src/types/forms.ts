
export interface FormResponse {
  id: string;
  worker_name: string;
  form_type: string;
  form_type_id?: string;
  empresa?: string;
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
  empresa?: string;
}

// Add these new interfaces to fix the type errors
export interface Company {
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
  company_id: string;
}

export interface CompanyWithFormTypes extends Company {
  formTypes: FormType[];
}

export type FieldType = 'text' | 'number' | 'checkbox' | 'select' | 'date' | 'textarea' | 'signature';
