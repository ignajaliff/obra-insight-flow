
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, FileText } from 'lucide-react';
import { CompanyWithFormTypes } from '@/types/forms';

interface CompaniesSectionProps {
  companies: CompanyWithFormTypes[];
  isLoading: boolean;
}

export function CompaniesSection({ companies, isLoading }: CompaniesSectionProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Empresas</h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/empresas">Ver todas</Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.length > 0 ? (
          companies.map((company) => (
            <Card key={company.id} className="flex flex-col bg-purple-50 border-purple-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 text-purple-600" size={20} />
                  {company.name}
                </CardTitle>
                <CardDescription>{company.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{company.formTypes.length}</span> tipos de formulario
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{company.formCount}</span> formularios completados
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full border-purple-200 hover:bg-purple-100">
                  <Link to={`/empresas/${company.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Ver formularios
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center p-12">
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-xl font-medium mb-1">No hay empresas disponibles</h3>
            <p className="text-muted-foreground">
              No se encontraron empresas registradas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
