
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

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'select' | 'date';
  required: boolean;
  options?: string[];
  field_order: number;
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
}
