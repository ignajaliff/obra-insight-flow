
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  errorMessage: string;
  backUrl?: string;
}

export function ErrorState({ 
  errorMessage, 
  backUrl = '/formularios' 
}: ErrorStateProps) {
  return (
    <div className="min-h-[300px] w-full flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm">
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <AlertCircle className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">Error al cargar el formulario</h3>
      <p className="text-muted-foreground text-center mb-4">
        {errorMessage}
      </p>
      <div className="flex gap-3">
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
        <Button asChild>
          <Link to={backUrl}>
            Ver formularios disponibles
          </Link>
        </Button>
      </div>
    </div>
  );
}
