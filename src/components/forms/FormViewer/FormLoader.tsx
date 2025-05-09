
import { useState, useEffect } from 'react';
import { FormTemplate } from '@/types/forms';
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
        let formFound = false;
        
        try {
          // Try to get the form from Supabase
          const { data: formData, error: supabaseError } = await supabase
            .from('form_templates')
            .select('*')
            .eq('id', templateId)
            .single();
          
          console.log("Supabase form data:", formData);
          console.log("Supabase error:", supabaseError);
          
          if (formData && !supabaseError) {
            // Add default fields if none are present
            const defaultFields = [
              {
                id: "1",
                name: "worker_name",
                label: "Nombre del Trabajador",
                type: "text",
                required: true,
                field_order: 0
              },
              {
                id: "2",
                name: "proyecto",
                label: "Proyecto",
                type: "text",
                required: true,
                field_order: 1
              }
            ];
            
            // Fixed TypeScript error: Explicitly cast to FormTemplate with fields
            const formWithFields: FormTemplate = {
              ...formData,
              // Add fields array, either from formData.fields or use default if undefined
              fields: (formData as any).fields || defaultFields
            };
            
            console.log("Form with fields:", formWithFields);
            onLoaded(formWithFields);
            formFound = true;
          }
        } catch (e) {
          // Continue to localStorage fallback
          console.error("Error al obtener formulario de Supabase:", e);
        }
        
        // If we didn't find the form in Supabase, try localStorage
        if (!formFound) {
          console.log("Form not found in Supabase, trying localStorage");
          
          try {
            const storedTemplates = JSON.parse(localStorage.getItem('formTemplates') || '[]');
            console.log("Local storage templates:", storedTemplates);
            
            const localTemplate = storedTemplates.find((t: any) => t.id === templateId);
            console.log("Found local template:", localTemplate);
            
            if (localTemplate) {
              // Ensure fields exist
              const templateWithFields: FormTemplate = {
                ...localTemplate,
                fields: localTemplate.fields || []
              };
              
              onLoaded(templateWithFields);
              formFound = true;
            } else {
              console.log("Form not found in localStorage either");
              onError('Formulario no encontrado');
            }
          } catch (localStorageError) {
            console.error("Error accessing localStorage:", localStorageError);
            onError('Error al buscar el formulario');
          }
        }
        
        if (!formFound) {
          console.log("Form not found anywhere");
          onError('Formulario no encontrado');
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
