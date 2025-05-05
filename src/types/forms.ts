
export interface FormResponse {
  id: string;
  worker_name: string;
  form_type: string;
  form_type_id?: string;
  date: string;
  status: 'Todo positivo' | 'Contiene item negativo';
  document_link?: string;
  created_at?: string;
}

export interface FormType {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyWithFormTypes extends Company {
  formTypes: FormType[];
  formCount: number;
}
