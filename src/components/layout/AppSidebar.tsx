
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  FileText, 
  Upload, 
  Users, 
  Settings,
  Building,
  List,
  PlusSquare
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
    title: "Formularios",
    path: "/formularios",
    icon: FileText,
    children: [
      {
        title: "Lista de formularios",
        path: "/formularios",
        icon: List
      },
      {
        title: "Mis formularios",
        path: "/formularios/mis-formularios",
        icon: FileText
      },
      {
        title: "Crear formulario",
        path: "/formularios/crear",
        icon: PlusSquare
      }
    ]
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
          <img 
            src="/lovable-uploads/e1717e3f-3d42-4acf-be38-5c58da1bd4d9.png" 
            alt="Sepcon Logo" 
            className="h-12 w-auto mb-1"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {!item.children ? (
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
                  ) : (
                    <>
                      <SidebarGroupLabel className="flex items-center gap-3">
                        <item.icon size={20} />
                        <span>{item.title}</span>
                      </SidebarGroupLabel>
                      <SidebarGroupContent className="ml-6 mt-2">
                        {item.children.map((child) => (
                          <SidebarMenuItem key={child.title}>
                            <SidebarMenuButton asChild>
                              <Link
                                to={child.path}
                                className={cn(
                                  "w-full flex items-center gap-3",
                                  (currentPath === child.path ||
                                    (currentPath.startsWith(child.path) && child.path !== '/formularios')) && 
                                    "bg-sidebar-accent text-primary"
                                )}
                              >
                                <child.icon size={16} />
                                <span>{child.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarGroupContent>
                    </>
                  )}
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
