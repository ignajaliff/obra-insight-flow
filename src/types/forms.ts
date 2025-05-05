
export interface FormResponse {
  id: string;
  worker_name: string;
  form_type: string;
  date: string;
  status: 'Todo positivo' | 'Contiene item negativo';
  document_link?: string;
  created_at?: string;
}
