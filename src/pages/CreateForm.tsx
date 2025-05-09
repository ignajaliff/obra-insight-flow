
import { FormBuilder } from '@/components/forms/FormBuilder';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateForm() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link to="/formularios">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Crear nuevo formulario</h1>
      </div>
      
      <FormBuilder />
    </div>
  );
}
