
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import FormsList from "./pages/FormsList";
import ImportData from "./pages/ImportData";
import NotFound from "./pages/NotFound";
import FormAdmin from "./pages/FormAdmin";
import AvailableForms from "./pages/AvailableForms";
import FormFillPage from "./pages/FormFillPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/formularios" element={<FormsList />} />
            <Route path="/formularios/disponibles" element={<AvailableForms />} />
            <Route path="/formularios/rellenar/:templateId" element={<FormFillPage />} />
            <Route path="/formularios/admin" element={<FormAdmin />} />
            <Route path="/importar" element={<ImportData />} />
            <Route path="/usuarios" element={<Dashboard />} /> {/* Placeholder */}
            <Route path="/configuracion" element={<Dashboard />} /> {/* Placeholder */}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
