
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
