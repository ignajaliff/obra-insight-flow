
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
        
        // Try to load from Supabase first
        try {
          // Get the form from Supabase including fields
          const { data: formData, error: supabaseError } = await supabase
            .from('form_templates')
            .select('*')
            .eq('id', templateId)
            .single();
          
          console.log("Supabase form data:", formData);
          console.log("Supabase error:", supabaseError);
          
          if (formData && !supabaseError) {
            // Check if fields exist and are in the right format
            let fields: FormField[] = [];
            
            // Parse fields if they're stored as a string
            if (typeof formData.fields === 'string') {
              try {
                fields = JSON.parse(formData.fields);
                console.log("Parsed fields:", fields);
              } catch (e) {
                console.error("Error parsing fields:", e);
                fields = [];
              }
            } else if (Array.isArray(formData.fields)) {
              // Properly cast the fields from Json to FormField[]
              fields = (formData.fields as any[]).map(field => ({
                id: String(field.id || ''),
                name: String(field.name || ''),
                label: String(field.label || ''),
                type: (field.type as FieldType) || 'text',
                required: Boolean(field.required),
                options: Array.isArray(field.options) ? field.options.map(String) : undefined,
                isNegativeIndicator: field.isNegativeIndicator ? Boolean(field.isNegativeIndicator) : undefined,
                field_order: Number(field.field_order || 0)
              }));
            }
            
            // Create a complete form template
            const formWithFields: FormTemplate = {
              id: formData.id,
              name: formData.name,
              description: formData.description || undefined,
              fields: fields,
              created_at: formData.created_at,
              updated_at: formData.updated_at,
              is_active: formData.is_active,
              public_url: formData.public_url,
              // Fix the property name mismatch - use projectmetadata from the database
              projectMetadata: formData.projectmetadata || undefined
            };
            
            console.log("Processed form:", formWithFields);
            onLoaded(formWithFields);
            onLoadingChange(false);
            return;
          }
        } catch (supabaseError) {
          console.error("Exception while fetching form from Supabase:", supabaseError);
        }
        
        // If Supabase fails or form not found, fall back to localStorage
        console.log("Form not found in Supabase, trying localStorage");
        
        try {
          const storedTemplates = localStorage.getItem('formTemplates');
          if (!storedTemplates) {
            console.log("No templates found in localStorage");
            onError('No se encontraron formularios guardados');
            onLoadingChange(false);
            return;
          }
          
          const parsedTemplates = JSON.parse(storedTemplates);
          console.log("Local storage templates:", parsedTemplates);
          
          if (!Array.isArray(parsedTemplates)) {
            console.log("Stored templates is not an array");
            onError('Formato de formularios guardados no válido');
            onLoadingChange(false);
            return;
          }
          
          const localTemplate = parsedTemplates.find((t: any) => t.id === templateId);
          console.log("Found local template:", localTemplate);
          
          if (localTemplate) {
            // Ensure fields exist and have the correct type
            const templateWithFields: FormTemplate = {
              ...localTemplate,
              fields: Array.isArray(localTemplate.fields) ? 
                localTemplate.fields.map((field: any) => ({
                  ...field,
                  type: field.type as FieldType
                })) : []
            };
            
            onLoaded(templateWithFields);
          } else {
            console.log("Form not found in localStorage either");
            onError('Formulario no encontrado');
          }
        } catch (localStorageError) {
          console.error("Error accessing localStorage:", localStorageError);
          onError('Error al buscar el formulario');
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
