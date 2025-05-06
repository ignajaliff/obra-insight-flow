
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FormTemplate } from '@/types/forms';
import { FormViewer } from '@/components/forms/FormViewer';

export default function FillForm() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Load the template from localStorage
    const loadTemplate = () => {
      try {
        const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
        const foundTemplate = storedTemplates.find((t: FormTemplate) => t.id === templateId);
        
        if (foundTemplate) {
          setTemplate(foundTemplate);
        } else {
          setError('Formulario no encontrado');
        }
      } catch (err) {
        console.error('Error loading template:', err);
        setError('Error al cargar el formulario');
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
  }, [templateId]);
  
  if (loading) {
    return <div className="flex justify-center p-8">Cargando formulario...</div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-destructive text-lg font-medium">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {template && (
        <FormViewer 
          template={template} 
          webhookUrl="https://primary-2yza-production.up.railway.app/webhook-test/119213b0-18e7-43bb-9309-dc5db1caaea6" 
        />
      )}
    </div>
  );
}
