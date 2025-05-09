
import { useState, useEffect } from 'react';
import { FormTemplate, FormField, FieldType } from '@/types/forms';
import { supabase } from '@/integrations/supabase/client';

interface FormLoaderProps {
  templateId: string | undefined;
  onLoaded: (template: FormTemplate) => void;
  onError: (errorMessage: string) => void;
  onLoadingChange: (isLoading: boolean) => void;
}

export function FormLoader({ 
  templateId, 
  onLoaded, 
  onError, 
  onLoadingChange 
}: FormLoaderProps) {
  useEffect(() => {
    // Load the template
    const loadTemplate = async () => {
      try {
        onLoadingChange(true);
        
        if (!templateId) {
          console.log("No template ID provided");
          onError('ID de formulario no proporcionado');
          onLoadingChange(false);
          return;
        }

        console.log("Loading template with ID:", templateId);
        
        // Get the form from Supabase
        const { data: formData, error: supabaseError } = await supabase
          .from('form_templates')
          .select('*')
          .eq('id', templateId)
          .single();
        
        console.log("Supabase form data:", formData);
        console.log("Supabase error:", supabaseError);
        
        if (formData && !supabaseError) {
          // Create a complete form template with proper types
          const fields: FormField[] = Array.isArray(formData.fields) 
            ? formData.fields.map((field: any) => ({
                id: String(field.id || ''),
                name: String(field.name || ''),
                label: String(field.label || ''),
                type: (field.type as FieldType) || 'text',
                required: Boolean(field.required),
                options: Array.isArray(field.options) ? field.options.map(String) : undefined,
                isNegativeIndicator: field.isNegativeIndicator ? Boolean(field.isNegativeIndicator) : undefined,
                field_order: Number(field.field_order || 0)
              }))
            : [];
            
          // Handle project metadata safely by creating a new object to avoid type issues
          const rawMetadata = formData.projectmetadata || {};
          const projectMetadata = {
            projectName: rawMetadata.projectName as string | undefined,
            companyName: rawMetadata.companyName as string | undefined,
            location: rawMetadata.location as string | undefined
          };
          
          const formWithFields: FormTemplate = {
            id: formData.id,
            name: formData.name,
            description: formData.description || undefined,
            fields: fields,
            created_at: formData.created_at,
            updated_at: formData.updated_at,
            is_active: formData.is_active,
            public_url: formData.public_url,
            projectMetadata: projectMetadata
          };
          
          console.log("Processed form template:", formWithFields);
          onLoaded(formWithFields);
        } else {
          console.log("Form not found or error:", supabaseError);
          onError('Formulario no encontrado o error al cargar');
        }
      } catch (err) {
        console.error('Error loading template:', err);
        onError('Error al cargar el formulario');
      } finally {
        onLoadingChange(false);
      }
    };
    
    loadTemplate();
  }, [templateId, onLoaded, onError, onLoadingChange]);
  
  return null;
}
