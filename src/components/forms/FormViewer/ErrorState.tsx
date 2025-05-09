
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  errorMessage: string;
}

export function ErrorState({ errorMessage }: ErrorStateProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc] p-4 md:p-8 text-center">
      <img 
        src="/lovable-uploads/34d0fb06-7794-4226-9339-3c5fb741836d.png" 
        alt="Sepcon Logo" 
        className="h-12 md:h-16 mb-6"
      />
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <div className="text-destructive text-xl font-medium mb-4">{errorMessage}</div>
        <p className="text-gray-600 mb-6">
          Es posible que este formulario ya no esté disponible o haya sido respondido anteriormente. Por favor verifica la URL o contacta a la persona que compartió el enlace.
        </p>
        
        <Button 
          className="w-full bg-[#5DADE2] hover:bg-[#3498DB]" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    </div>
  );
}
