
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Header } from './Header';
import { Outlet, useLocation } from 'react-router-dom';

export function AppLayout() {
  const location = useLocation();
  
  // Map routes to titles
  const getTitleByPath = (path: string) => {
    switch(path) {
      case '/':
        return 'Dashboard';
      case '/formularios/mis-formularios':
        return 'Mis Formularios';
      case '/formularios/crear':
        return 'Crear Formulario';
      case '/usuarios':
        return 'Usuarios';
      default:
        return 'Dashboard';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={getTitleByPath(location.pathname)} />
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
