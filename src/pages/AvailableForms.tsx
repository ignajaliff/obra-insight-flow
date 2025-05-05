
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormType, Company } from '@/types/forms';

interface CompanyWithFormTypes extends Company {
  formTypes: FormType[];
}

const AvailableForms = () => {
  const [companies, setCompanies] = useState<CompanyWithFormTypes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompaniesAndFormTypes = async () => {
      setIsLoading(true);
      try {
        // Obtener todas las empresas
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .order('name');
        
        if (companiesError) throw companiesError;
        
        // Obtener todos los tipos de formulario
        const { data: formTypesData, error: formTypesError } = await supabase
          .from('form_types')
          .select('*')
          .order('name');
        
        if (formTypesError) throw formTypesError;
        
        // Combinar datos para crear CompanyWithFormTypes[]
        const enhancedCompanies: CompanyWithFormTypes[] = companiesData.map((company: Company) => {
          // Filtrar tipos de formulario para esta empresa
          const companyFormTypes = formTypesData.filter(
            (formType: FormType) => formType.company_id === company.id
          );
          
          return {
            ...company,
            formTypes: companyFormTypes
          };
        });
        
        setCompanies(enhancedCompanies);
      } catch (error) {
        console.error('Error loading companies and form types:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron cargar las empresas y tipos de formularios",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompaniesAndFormTypes();
  }, [toast]);

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Formularios Disponibles</h1>
          <p className="text-muted-foreground">
            Selecciona un tipo de formulario para completar
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {companies.length > 0 ? (
            companies.map((company) => (
              <div key={company.id} className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Building className="text-primary" size={20} />
                  <h2 className="text-xl font-semibold">{company.name}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {company.formTypes.length > 0 ? (
                    company.formTypes.map((formType) => (
                      <Card key={formType.id} className="flex flex-col">
                        <CardHeader>
                          <CardTitle>{formType.name}</CardTitle>
                          <CardDescription>
                            {formType.description || 'Formulario de registro'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm text-muted-foreground">
                            Empresa: {company.name}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild className="w-full">
                            <Link to={`/formularios/rellenar/${formType.id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              Completar Formulario
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-6">
                      <p className="text-muted-foreground">
                        No hay formularios disponibles para esta empresa.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-xl font-medium mb-1">No hay empresas disponibles</h3>
              <p className="text-muted-foreground">
                No se encontraron empresas o formularios para completar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableForms;
