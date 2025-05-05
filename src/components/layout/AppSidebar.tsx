
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  FileText, 
  Upload, 
  Users, 
  Settings,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: BarChart2
  },
  {
    title: "Empresas",
    path: "/empresas",
    icon: Building
  },
  {
    title: "Formularios",
    path: "/formularios",
    icon: FileText
  },
  {
    title: "Importar datos",
    path: "/importar",
    icon: Upload
  },
  {
    title: "Usuarios",
    path: "/usuarios",
    icon: Users
  },
  {
    title: "Configuración",
    path: "/configuracion",
    icon: Settings
  }
];

export function AppSidebar() {
  // Get current path to highlight active link
  const currentPath = window.location.pathname;

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="py-6">
        <div className="px-4 flex flex-col justify-center items-center">
          <h1 className="text-2xl font-bold text-white">Sepcon</h1>
          <p className="text-xs text-muted-foreground">Gestión de formularios</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.path}
                      className={cn(
                        "w-full flex items-center gap-3",
                        currentPath === item.path && "bg-sidebar-accent text-primary"
                      )}
                    >
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="py-4 px-4">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Constructora ABC</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
