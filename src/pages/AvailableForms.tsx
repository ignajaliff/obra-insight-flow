
import React from 'react';
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
import { FormTemplate } from '@/pages/FormAdmin';
import { FileText } from 'lucide-react';

// En un proyecto real, estos datos vendrían de la base de datos
const mockTemplates: FormTemplate[] = [
  {
    id: '1',
    name: 'Checklist de Seguridad',
    description: 'Formulario para verificar condiciones de seguridad en obra',
    fields: [
      {
        id: 'field1',
        name: 'area',
        label: 'Área de trabajo',
        type: 'text',
        required: true,
      },
      {
        id: 'field2',
        name: 'equipoSeguridad',
        label: '¿Todos los trabajadores usan equipo de seguridad?',
        type: 'checkbox',
        required: true,
        isNegativeIndicator: true,
      },
      {
        id: 'field3',
        name: 'riesgosIdentificados',
        label: 'Riesgos identificados',
        type: 'textarea',
        required: false,
        isNegativeIndicator: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Informe Diario de Obra',
    description: 'Registro diario de avances y actividades en obra',
    fields: [
      {
        id: 'field1',
        name: 'proyecto',
        label: 'Proyecto',
        type: 'text',
        required: true,
      },
      {
        id: 'field2',
        name: 'fecha',
        label: 'Fecha',
        type: 'date',
        required: true,
      },
      {
        id: 'field3',
        name: 'avance',
        label: 'Porcentaje de avance',
        type: 'number',
        required: true,
      },
      {
        id: 'field4',
        name: 'problemas',
        label: 'Problemas encontrados',
        type: 'textarea',
        required: false,
        isNegativeIndicator: true,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const AvailableForms = () => {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Formularios Disponibles</h1>
          <p className="text-muted-foreground">
            Selecciona un formulario para completar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm">
                {template.fields.length} campos en total
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={`/formularios/rellenar/${template.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Completar Formulario
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}

        {mockTemplates.length === 0 && (
          <div className="col-span-full text-center p-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-xl font-medium mb-1">No hay formularios disponibles</h3>
            <p className="text-muted-foreground">
              No se encontraron formularios para completar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableForms;
