
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { FormEntry } from '../forms/FormsTable';

interface CsvUploaderProps {
  onImport: (data: FormEntry[]) => void;
}

export function CsvUploader({ onImport }: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleUpload = () => {
    if (!file) return;

    // For demo purposes, we'll simulate reading the CSV file and importing data
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          
          // Simulate successful import with sample data
          setTimeout(() => {
            setIsUploading(false);
            setUploadStatus('success');
            
            const sampleData = generateSampleFormEntries();
            onImport(sampleData);
          }, 500);
          
          return 100;
        }
        return next;
      });
    }, 200);
  };

  // Generate sample form entries for demo
  const generateSampleFormEntries = (): FormEntry[] => {
    const formTypes = [
      'Inspección de seguridad',
      'Reporte diario',
      'Control de calidad',
      'Incidentes',
      'Entrega de EPP',
    ];
    
    return Array.from({ length: 10 }, (_, index) => ({
      id: `form-${index + 1}`,
      workerName: `Trabajador ${index + 1}`,
      formType: formTypes[Math.floor(Math.random() * formTypes.length)],
      date: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      hasNegativeEvent: Math.random() > 0.7,
      driveLink: 'https://drive.google.com/file',
      reviewStatus: Math.random() > 0.5 ? 'reviewed' : 'pending',
    }));
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
