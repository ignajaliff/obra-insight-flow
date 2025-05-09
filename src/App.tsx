
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ImportData from "./pages/ImportData";
import NotFound from "./pages/NotFound";
import FormAdmin from "./pages/FormAdmin";
import Login from "./pages/Login";
import UsersManagement from "./pages/UsersManagement";
import Index from "./pages/Index";
import MyForms from "./pages/MyForms";
import FillForm from "./pages/FillForm";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Public Form Route - Must be outside the AppLayout to be fully public */}
          <Route path="/formularios/rellenar/:templateId" element={<FillForm />} />

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/formularios" element={<MyForms />} />
            <Route path="/formularios/mis-formularios" element={<MyForms />} />
            <Route path="/formularios/ver/:templateId" element={<FormAdmin />} />
            <Route path="/importar" element={<ImportData />} />
            <Route path="/usuarios" element={<UsersManagement />} />
            <Route path="/configuracion" element={<Dashboard />} /> {/* Placeholder */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
