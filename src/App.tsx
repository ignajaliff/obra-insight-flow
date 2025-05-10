
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import MyForms from "./pages/MyForms";
import CreateForm from "./pages/CreateForm";
import FillForm from "./pages/FillForm";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import UsersManagement from "./pages/UsersManagement";
import Index from "./pages/Index";
import ImportData from "./pages/ImportData";
import { supabase } from "./integrations/supabase/client";

const App = () => {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    // Verificar la conexión a Supabase
    const checkSupabaseConnection = async () => {
      try {
        // Intentar con form_templates primero, ya que es la tabla que sabemos que existe
        const { data: templatesData, error: templatesError } = await supabase
          .from('form_templates')
          .select('count')
          .limit(1)
          .single();
          
        if (templatesError && templatesError.code !== 'PGRST116') {
          // Si hay un error con form_templates, intentar con form_responses como fallback
          const { data, error } = await supabase.from('form_responses').select('count').single();
          
          if (error && error.code !== 'PGRST116') {  // PGRST116 es "no hay filas devueltas" lo cual es normal
            console.error("Error conectando con Supabase:", error);
          } else {
            console.log("Conexión a Supabase establecida correctamente");
          }
        } else {
          console.log("Conexión a Supabase establecida correctamente");
        }
      } catch (err) {
        console.error("Error verificando conexión a Supabase:", err);
      } finally {
        setInitialized(true);
      }
    };
    
    checkSupabaseConnection();
  }, []);
  
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Inicializando...</p>
      </div>
    );
  }
  
  return (
    <React.StrictMode>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Public Form Route - This must be outside the AppLayout */}
            <Route path="/formularios/rellenar/:templateId" element={<FillForm />} />

            {/* Protected Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/formularios/mis-formularios" element={<MyForms />} />
              <Route path="/formularios/crear" element={<CreateForm />} />
              <Route path="/importar" element={<ImportData />} />
              <Route path="/usuarios" element={<UsersManagement />} />
              <Route path="/configuracion" element={<Dashboard />} /> {/* Placeholder */}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </React.StrictMode>
  );
};

export default App;
