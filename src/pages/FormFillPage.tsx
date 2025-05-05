
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { FormFill } from '@/components/forms/FormFill';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormType, Company } from '@/types/forms';

const FormFillPage = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formTemplate, setFormTemplate] = useState<FormType | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFormTemplate = async () => {
      if (!templateId) return;

      setIsLoading(true);
      try {
        // Obtener el tipo de formulario
        const { data: formTypeData, error: formTypeError } = await supabase
          .from('form_types')
          .select('*')
          .eq('id', templateId)
          .single();
        
        if (formTypeError) {
          throw formTypeError;
        }
        
        if (!formTypeData) {
          throw new Error('No se encontró el tipo de formulario');
        }
        
        setFormTemplate(formTypeData);
        
        // Obtener la empresa asociada
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', formTypeData.company_id)
          .single();
        
        if (companyError) {
          throw companyError;
        }
        
        setCompany(companyData);
      } catch (error) {
        console.error('Error loading form template:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el formulario",
        });
        navigate('/formularios/disponibles');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormTemplate();
  }, [templateId, navigate, toast]);

  const handleGoBack = () => {
    navigate('/formularios/disponibles');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!formTemplate || !company) {
    return (
      <div className="container py-6">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Formulario no encontrado</h2>
          <p className="mb-6">El formulario que intentas acceder no existe o ha sido eliminado.</p>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a formularios disponibles
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{formTemplate.name}</h1>
        <p className="text-muted-foreground">
          Empresa: {company.name} | {formTemplate.description || 'Formulario de inspección'}
        </p>
      </div>

      <FormFill
        formId={formTemplate.id}
        formType={formTemplate.name}
        onComplete={() => {
          toast({
            title: 'Formulario enviado',
            description: 'El formulario ha sido guardado correctamente.'
          });
          navigate('/formularios');
        }}
      />
    </div>
  );
};

export default FormFillPage;
