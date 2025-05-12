
export interface FormTemplate {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  created_at: string;
  updated_at: string;
  public_url?: string;
  projectMetadata?: ProjectMetadata;
}

export interface ProjectMetadata {
  projectName?: string;
  companyName?: string;
  location?: string;
  [key: string]: string | undefined;
}

export type FieldType = 'text' | 'select' | 'date' | 'textarea' | 'signature' | 'checkbox' | 'number';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  field_order: number;
  isNegativeIndicator?: boolean;
}

export interface FormSubmission {
  id: string;
  templateId: string;
  values: Record<string, any>;
  submissionDate: string;
  submitter_name: string;
  template_name: string;
  signatureImg?: string | null;
  projectMetadata?: ProjectMetadata;
  created_at?: string;
}

export interface FormResponse {
  id: string;
  form_type: string;
  worker_name: string;
  date: string;
  proyecto: string | null;
  status: string;
  document_link: string | null;
  created_at: string | null;
  // Removed ID_documento as it doesn't exist in the actual data
}
