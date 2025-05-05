
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FormResponse } from '@/types/forms';

interface CsvUploaderProps {
  onImport: (data: FormResponse[]) => void;
}

export function CsvUploader({ onImport }: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Para demo, simulamos la lectura del archivo CSV e importamos datos
    setIsUploading(true);
    setUploadProgress(0);

    // Simulación de progreso
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, 200);

    try {
      // Aquí simularemos el proceso de lectura de un archivo CSV y creación de datos simulados
      const formTypes = ['Inspección de seguridad', 'Reporte diario', 'Control de calidad', 'Incidentes', 'Entrega de EPP'];
      const workerNames = ['Juan Pérez', 'María López', 'Carlos Rodríguez', 'Ana Martínez', 'Roberto Díaz', 'Luisa Fernández'];
      const statuses = ['Todo positivo', 'Contiene item negativo'];
      
      // Generar envíos simulados
      const sampleData: FormResponse[] = [];
      
      // Crear entre 5-10 registros aleatorios
      const entriesCount = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 0; i < entriesCount; i++) {
        const randomWorkerName = workerNames[Math.floor(Math.random() * workerNames.length)];
        const randomFormType = formTypes[Math.floor(Math.random() * formTypes.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Fecha aleatoria en los últimos 30 días
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
        const formattedDate = randomDate.toISOString().split('T')[0];
        
        // Insertar en la base de datos
        const { data: newResponse, error } = await supabase
          .from('form_responses')
          .insert({
            worker_name: randomWorkerName,
            form_type: randomFormType,
            date: formattedDate,
            status: randomStatus as 'Todo positivo' | 'Contiene item negativo',
            document_link: `https://drive.google.com/file/d/example${i+1}`
          })
          .select()
          .single();
        
        if (error) throw error;
        
        if (newResponse) {
          sampleData.push(newResponse);
        }
      }
      
      // Simular finalización exitosa
      setTimeout(() => {
        setIsUploading(false);
        setUploadStatus('success');
        onImport(sampleData);
        
        toast({
          title: "Importación exitosa",
          description: `Se importaron ${sampleData.length} registros correctamente.`,
        });
      }, 500);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadStatus('error');
      setErrorMessage('Ocurrió un error durante la importación.');
      
      toast({
        variant: "destructive",
        title: "Error en la importación",
        description: "No se pudieron importar los datos correctamente.",
      });
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex flex-col gap-4">
        <div className="text-center">
          <div className="mx-auto bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <FileText className="text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">Importar datos desde CSV</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sube un archivo CSV con tus datos de formularios
          </p>
        </div>

        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <input
            type="file"
            id="file-upload"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer block mb-3"
          >
            <div className="mx-auto bg-brand-50 w-10 h-10 rounded-full flex items-center justify-center mb-3">
              <Upload className="text-brand-600" size={18} />
            </div>
            <span className="text-sm font-medium">
              Haz clic para seleccionar un archivo
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              CSV, Excel aceptados (Max. 10MB)
            </p>
          </label>

          {file && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <FileText size={16} className="text-brand-600" />
              <span className="font-medium">{file.name}</span>
              <span className="text-muted-foreground">
                ({(file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              Subiendo archivo... {uploadProgress}%
            </p>
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
            <Check size={16} />
            <span>¡Archivo importado exitosamente!</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            <X size={16} />
            <span>{errorMessage || 'Ha ocurrido un error al importar el archivo.'}</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" disabled={isUploading}>
            Cancelar
          </Button>
          <Button 
            disabled={!file || isUploading} 
            onClick={handleUpload}
          >
            {isUploading ? 'Importando...' : 'Importar datos'}
          </Button>
        </div>
      </div>
    </div>
  );
}
