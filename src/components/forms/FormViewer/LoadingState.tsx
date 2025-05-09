
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg font-medium text-center">{message}</p>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Por favor espere mientras cargamos el formulario...
        </p>
      </CardContent>
    </Card>
  );
}
