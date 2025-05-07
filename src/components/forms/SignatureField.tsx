
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Check } from 'lucide-react';

interface SignatureFieldProps {
  id: string;
  value: string | null;
  onChange: (value: string | null) => void;
  readOnly?: boolean;
}

export function SignatureField({ id, value, onChange, readOnly = false }: SignatureFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Initialize canvas and load existing signature if any
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas style
    ctx.lineWidth = 1.5; // Más delgada para optimizar
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Load existing signature if available
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = value;
    }
  }, [value]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const endDrawing = () => {
    if (!isDrawing || readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    setIsDrawing(false);
    
    // Save the signature
    if (hasSignature) {
      const dataURL = optimizeSignature();
      onChange(dataURL);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onChange(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    
    const dataURL = optimizeSignature();
    onChange(dataURL);
  };

  // Función para optimizar la firma
  const optimizeSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    
    // Usa una calidad más baja para reducir el tamaño
    return canvas.toDataURL('image/png', 0.5);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div 
        className="border rounded-md bg-white relative"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          id={id}
          width={400}
          height={150} // Reducimos la altura para optimizar
          className="w-full h-auto cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
      </div>
      
      {!readOnly && (
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={clearSignature}
            disabled={!hasSignature}
            className="text-gray-600 hover:bg-gray-100"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Borrar firma
          </Button>
          <Button 
            type="button"
            onClick={saveSignature}
            disabled={!hasSignature}
            className="bg-primary hover:bg-primary/90"
          >
            <Check className="mr-2 h-4 w-4" /> Confirmar firma
          </Button>
        </div>
      )}
    </div>
  );
}
