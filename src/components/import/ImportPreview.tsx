
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { FormsTable } from '../forms/FormsTable';
import { FormResponse } from '@/types/forms';

interface ImportPreviewProps {
  previewData: FormResponse[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportPreview({ previewData, onConfirm, onCancel }: ImportPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Vista previa de importación</h2>
        <div className="text-sm text-muted-foreground">
          {previewData.length} registros encontrados
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <FormsTable forms={previewData} />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} className="gap-1">
          <X size={16} /> Cancelar
        </Button>
        <Button onClick={onConfirm} className="gap-1">
          <Check size={16} /> Confirmar importación
        </Button>
      </div>
    </div>
  );
}
