
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Cargando formulario..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#e7f5fa] to-[#d4f0fc]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-[#2980b9] animate-spin" />
        <p className="text-lg font-medium text-[#2980b9]">{message}</p>
      </div>
    </div>
  );
}
