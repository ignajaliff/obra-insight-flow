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

// Definiciones eliminadas ya que las tablas fueron eliminadas
// FormType, Company, CompanyWithFormTypes

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'checkbox' | 'select' | 'date' | 'textarea';
  required: boolean;
  options?: string[];
  isNegativeIndicator?: boolean;
  field_order: number;
}
