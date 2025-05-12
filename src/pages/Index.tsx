
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, BarChart2, Users } from 'lucide-react';

const Index = () => {
  return (
    <div className="container py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Sistema de Gestión de Formularios</h1>
        <p className="text-lg text-muted-foreground">
          Administra, visualiza y analiza formularios de seguridad y calidad
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-brand-50 border-brand-100">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                <BarChart2 className="text-brand-700" size={24} />
              </div>
              <h3 className="text-lg font-medium mb-2">Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Visualiza estadísticas y métricas de formularios
              </p>
              <Button asChild variant="default" className="w-full">
                <Link to="/dashboard">Ver dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-blue-700" size={24} />
              </div>
              <h3 className="text-lg font-medium mb-2">Mis Formularios</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Accede a tus formularios
              </p>
              <Button asChild variant="outline" className="w-full border-blue-200 hover:bg-blue-100">
                <Link to="/formularios/mis-formularios">Ver formularios</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="text-green-700" size={24} />
              </div>
              <h3 className="text-lg font-medium mb-2">Usuarios</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Administra los usuarios del sistema
              </p>
              <Button asChild variant="outline" className="w-full border-green-200 hover:bg-green-100">
                <Link to="/usuarios">Ver usuarios</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Información del sistema</h2>
          <p className="mb-4">
            Este sistema permite gestionar formularios de inspecciones de seguridad y calidad por empresa. 
            Puedes visualizar estadísticas en el dashboard, administrar tus formularios
            o gestionar los usuarios del sistema.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild variant="default">
              <Link to="/dashboard">
                <BarChart2 className="mr-2 h-4 w-4" />
                Ir al Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/formularios/mis-formularios">
                <FileText className="mr-2 h-4 w-4" />
                Mis formularios
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
