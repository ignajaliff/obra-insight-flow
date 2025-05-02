
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Save, X, Edit, Trash2 } from 'lucide-react';
import { FormTemplateEditor } from '@/components/forms/FormTemplateEditor';
import { FormTemplateList } from '@/components/forms/FormTemplateList';

// Tipos de formularios predefinidos
export type FieldType = 'text' | 'number' | 'checkbox' | 'select' | 'date' | 'textarea';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // Para campos select
  isNegativeIndicator?: boolean; // Indica si este campo puede contener un valor negativo
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

// Ejemplos de formularios predefinidos
const initialTemplates: FormTemplate[] = [
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

const FormAdmin = () => {
  const [templates, setTemplates] = useState<FormTemplate[]>(initialTemplates);
  const [activeTab, setActiveTab] = useState<string>('list');
  const [currentTemplate, setCurrentTemplate] = useState<FormTemplate | null>(null);

  const handleCreateNew = () => {
    const newTemplate: FormTemplate = {
      id: `template-${Date.now()}`,
      name: 'Nuevo Formulario',
      description: 'Descripción del nuevo formulario',
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentTemplate(newTemplate);
    setActiveTab('edit');
  };

  const handleEdit = (template: FormTemplate) => {
    setCurrentTemplate({ ...template });
    setActiveTab('edit');
  };

  const handleSave = (template: FormTemplate) => {
    const updatedTemplate = {
      ...template,
      updatedAt: new Date().toISOString(),
    };
    
    if (templates.some((t) => t.id === template.id)) {
      // Update existing template
      setTemplates(
        templates.map((t) => (t.id === template.id ? updatedTemplate : t))
      );
    } else {
      // Add new template
      setTemplates([...templates, updatedTemplate]);
    }
    
    setActiveTab('list');
    setCurrentTemplate(null);
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id));
    if (currentTemplate?.id === id) {
      setCurrentTemplate(null);
      setActiveTab('list');
    }
  };

  const handleCancel = () => {
    setCurrentTemplate(null);
    setActiveTab('list');
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Administración de Formularios</h1>
          <p className="text-muted-foreground">
            Crea y gestiona formularios predefinidos para tu equipo
          </p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <PlusCircle size={16} />
          Crear Formulario
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Formularios</TabsTrigger>
          <TabsTrigger value="edit" disabled={!currentTemplate}>
            {currentTemplate ? 'Editar Formulario' : 'Nuevo Formulario'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <FormTemplateList
            templates={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          {currentTemplate && (
            <FormTemplateEditor
              template={currentTemplate}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FormAdmin;
