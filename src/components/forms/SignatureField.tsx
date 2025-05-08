
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [paths, setPaths] = useState<Array<{points: {x: number, y: number}[]}>>([]); 
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);

  // Handle canvas resize to match container
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      
      // Set canvas dimensions to match container's CSS dimensions
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 150; // Fixed height for consistency
      
      // Redraw signature after resize
      drawSignature();
    };
    
    // Initial resize and add listener
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Initialize canvas and load existing signature if any
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    drawSignature();
  }, [value]);
  
  // Draw the signature on canvas
  const drawSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas style
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    // Load existing signature if available
    if (value) {
      if (value.startsWith('data:image/svg+xml')) {
        // SVG signature - we need to render it on canvas
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setHasSignature(true);
        };
        img.src = value;
      } else {
        // Legacy PNG format
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setHasSignature(true);
        };
        img.src = value;
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    
    // Store the beginning of the path
    setCurrentPath([{x, y}]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
    
    // Add to current path
    setCurrentPath(prevPath => [...prevPath, {x, y}]);
  };

  const endDrawing = () => {
    if (!isDrawing || readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.closePath();
    setIsDrawing(false);
    
    // Store the complete path
    if (currentPath.length > 1) {
      setPaths(prevPaths => [...prevPaths, {points: currentPath}]);
      setCurrentPath([]);
    }
    
    // Save the signature
    if (hasSignature) {
      const svgString = createSVGFromPaths();
      onChange(svgString);
    }
  };

  // Convert paths to SVG format
  const createSVGFromPaths = () => {
    const canvas = canvasRef.current;
    if (!canvas) return '';
    
    const width = canvas.width;
    const height = canvas.height;
    
    let pathsData = '';
    
    // Generate path data from stored paths
    paths.forEach(path => {
      if (path.points.length < 2) return;
      
      let pathData = `M${path.points[0].x},${path.points[0].y}`;
      for (let i = 1; i < path.points.length; i++) {
        pathData += ` L${path.points[i].x},${path.points[i].y}`;
      }
      pathsData += `<path d="${pathData}" stroke="black" stroke-width="1.5" fill="none" stroke-linecap="round" />`;
    });
    
    // Add current path if it exists
    if (currentPath.length >= 2) {
      let pathData = `M${currentPath[0].x},${currentPath[0].y}`;
      for (let i = 1; i < currentPath.length; i++) {
        pathData += ` L${currentPath[i].x},${currentPath[i].y}`;
      }
      pathsData += `<path d="${pathData}" stroke="black" stroke-width="1.5" fill="none" stroke-linecap="round" />`;
    }
    
    // Create SVG string
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${pathsData}</svg>`;
    
    // Convert to data URL
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setPaths([]);
    setCurrentPath([]);
    onChange(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return;
    
    const svgString = createSVGFromPaths();
    onChange(svgString);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div 
        ref={containerRef}
        className="border rounded-md bg-white relative"
        style={{ touchAction: 'none' }}
      >
        <canvas
          ref={canvasRef}
          id={id}
          height={150}
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
