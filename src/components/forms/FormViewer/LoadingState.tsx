
import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
  return (
    <div className="min-h-[300px] w-full flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-lg font-medium text-center">{message}</p>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        Por favor espere mientras cargamos el formulario...
      </p>
    </div>
  );
}
