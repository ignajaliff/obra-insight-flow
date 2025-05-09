
import { useState, useEffect } from 'react';
import { FormTemplate } from '@/types/forms';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { FormBasicInfo } from './FormBasicInfo';
import { FieldsList } from './FieldsList';
import { AddFieldSection } from './AddFieldSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SaveSection } from './SaveSection';
import { useFormValidation } from './useFormValidation';

interface FormBuilderProps {
  onFormCreated?: () => void;
  initialTemplate?: FormTemplate;
}

export function FormBuilder({ onFormCreated, initialTemplate }: FormBuilderProps) {
  const navigate = useNavigate();
  const [template, setTemplate] = useState<FormTemplate>(
    initialTemplate || {
      id: uuidv4(),
      name: '',
      fields: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      projectMetadata: {
        projectName: '',
        companyName: '',
        location: ''
      },
    }
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  const [formSaved, setFormSaved] = useState(false);
  
  // Use the validation hook
  const { validateForm } = useFormValidation(template);
  
  // Use effect to update form if initialTemplate changes
  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
  }, [initialTemplate]);
  
  return (
    <div className="space-y-6">
      <FormBasicInfo 
        template={template}
        setTemplate={setTemplate}
      />
      
      <div className="border-t pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="fields">Campos del formulario</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fields" className="space-y-6">
            <FieldsList 
              fields={template.fields}
              setTemplate={setTemplate}
            />
            
            <AddFieldSection 
              template={template}
              setTemplate={setTemplate}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="border-t pt-6 flex justify-end">
        <SaveSection
          template={template}
          initialTemplate={initialTemplate}
          onFormCreated={onFormCreated}
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          formSaved={formSaved}
          setFormSaved={setFormSaved}
          validateForm={validateForm}
        />
      </div>
    </div>
  );
}
