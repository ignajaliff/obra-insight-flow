
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
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#6EC1E4] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-[#2980b9]">Cargando formulario...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-8 space-y-4">
        <div className="text-destructive text-xl font-medium">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <img 
            src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
            alt="Sepcon Logo" 
            className="h-16"
          />
        </div>
        
        {template && (
          <FormViewer 
            template={template} 
            webhookUrl="https://n8n-n8n.qqtfab.easypanel.host/webhook-test/041274fe-3d47-4cdf-b4c2-114b661ef850" 
          />
        )}
      </div>
    </div>
  );
}
