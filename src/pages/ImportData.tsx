
import React, { useState } from 'react';
import { CsvUploader } from '@/components/import/CsvUploader';
import { ImportPreview } from '@/components/import/ImportPreview';
import { FormResponse } from '@/types/forms';
import { useToast } from '@/hooks/use-toast';

const ImportData = () => {
  const [previewData, setPreviewData] = useState<FormResponse[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const handleImport = (data: FormResponse[]) => {
    setPreviewData(data);
    setShowPreview(true);
  };

  const handleConfirmImport = () => {
    // En una app real, aquí guardaríamos los datos en la base de datos
    toast({
      title: "Importación exitosa",
      description: `Se importaron ${previewData.length} registros correctamente.`,
    });
    
    setPreviewData([]);
    setShowPreview(false);
  };

  const handleCancelImport = () => {
    setPreviewData([]);
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importar datos</h1>
        <p className="text-muted-foreground">Importa tus formularios desde diversos orígenes</p>
      </div>

      {showPreview ? (
        <ImportPreview 
          previewData={previewData} 
          onConfirm={handleConfirmImport}
          onCancel={handleCancelImport}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <CsvUploader onImport={handleImport} />
          
          <div className="border rounded-lg p-6 bg-white">
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <div className="mx-auto bg-muted w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground">
                    <path d="M6 15H18M12 3V9M12 9H7.5C6.10444 9 5.40665 9 4.83886 9.33706C4.34797 9.6146 3.96395 10.0407 3.7356 10.5729C3.47819 11.1828 3.52337 11.9312 3.61373 13.428L3.85338 17.5C3.98852 19.85 4.05609 21.025 4.87866 21.7125C5.70124 22.4 6.87606 22.4 9.2257 22.4H14.7743C17.1239 22.4 18.2988 22.4 19.1213 21.7125C19.9439 21.025 20.0115 19.85 20.1466 17.5L20.3863 13.428C20.4766 11.9312 20.5218 11.1828 20.2644 10.5729C20.036 10.0407 19.652 9.6146 19.1611 9.33706C18.5933 9 17.8956 9 16.5 9H12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-medium text-lg">Integración con JotForm</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Importa directamente desde tu cuenta de JotForm
                </p>
              </div>

              <div className="border-2 border-dashed rounded-lg p-6 text-center h-44 flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Próximamente - Integración directa con JotForm
                </p>
                <button 
                  className="mt-3 px-4 py-2 bg-gray-200 text-gray-500 rounded text-sm cursor-not-allowed"
                  disabled
                >
                  Conectar JotForm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-muted rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Requisitos del formato CSV</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Tu archivo CSV debe contener las siguientes columnas:
        </p>
        <ul className="text-sm list-disc list-inside text-muted-foreground space-y-1">
          <li>nombre_obrero: Nombre completo del obrero</li>
          <li>tipo_formulario: Tipo de formulario</li>
          <li>fecha: Formato DD/MM/YYYY</li>
          <li>estado: Valores "Todo positivo" o "Contiene item negativo"</li>
          <li>enlace_drive: URL completa al documento en Google Drive</li>
        </ul>
      </div>
    </div>
  );
};

export default ImportData;
