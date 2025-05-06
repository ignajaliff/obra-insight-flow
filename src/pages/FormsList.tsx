import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { Plus } from 'lucide-react';

export default function FormsList() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Lista de formularios</h1>
      
      {/* Aquí iría la tabla de formularios existente */}
      
      {/* Botón flotante para crear nuevo formulario */}
      <FloatingActionButton 
        icon={<Plus className="h-6 w-6" />} 
        href="/formularios/mis-formularios" 
        aria-label="Crear nuevo formulario"
      />
    </div>
  );
}
