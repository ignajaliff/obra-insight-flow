
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SignatureField } from '../SignatureField';

interface AdditionalInfoSectionProps {
  elaboradoPor: string;
  setElaboradoPor: React.Dispatch<React.SetStateAction<string>>;
  supervisor: string;
  setSupervisor: React.Dispatch<React.SetStateAction<string>>;
  supervisorSSMA: string;
  setSupervisorSSMA: React.Dispatch<React.SetStateAction<string>>;
  observaciones: string;
  setObservaciones: React.Dispatch<React.SetStateAction<string>>;
  firma: string | null;
  setFirma: React.Dispatch<React.SetStateAction<string | null>>;
  cargo: string;
  setCargo: React.Dispatch<React.SetStateAction<string>>;
  readOnly?: boolean;
}

export function AdditionalInfoSection({
  elaboradoPor,
  setElaboradoPor,
  supervisor,
  setSupervisor,
  supervisorSSMA,
  setSupervisorSSMA,
  observaciones,
  setObservaciones,
  firma,
  setFirma,
  cargo,
  setCargo,
  readOnly = false
}: AdditionalInfoSectionProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium mb-4">Información adicional</h3>
      
      <div className="space-y-4">
        {/* Elaborado por */}
        <div>
          <Label htmlFor="elaborado-por">Elaborado por</Label>
          <Input
            id="elaborado-por"
            value={elaboradoPor}
            onChange={(e) => setElaboradoPor(e.target.value)}
            placeholder="Nombre de quien elaboró"
            disabled={readOnly}
            className="w-full"
          />
        </div>
        
        {/* Supervisor/Capataz */}
        <div>
          <Label htmlFor="supervisor">Supervisor/Capataz</Label>
          <Input
            id="supervisor"
            value={supervisor}
            onChange={(e) => setSupervisor(e.target.value)}
            placeholder="Nombre del supervisor o capataz"
            disabled={readOnly}
            className="w-full"
          />
        </div>
        
        {/* Supervisor de SSMA */}
        <div>
          <Label htmlFor="supervisor-ssma">Supervisor de SSMA</Label>
          <Input
            id="supervisor-ssma"
            value={supervisorSSMA}
            onChange={(e) => setSupervisorSSMA(e.target.value)}
            placeholder="Nombre del supervisor de SSMA"
            disabled={readOnly}
            className="w-full"
          />
        </div>
        
        {/* Observaciones */}
        <div>
          <Label htmlFor="observaciones">Observaciones</Label>
          <Textarea
            id="observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ingrese sus observaciones"
            disabled={readOnly}
            rows={3}
            className="w-full"
          />
        </div>
        
        {/* Firma */}
        <div>
          <Label htmlFor="firma">Firma</Label>
          <SignatureField
            id="firma"
            value={firma}
            onChange={setFirma}
            readOnly={readOnly}
          />
        </div>
        
        {/* Cargo */}
        <div>
          <Label htmlFor="cargo">Cargo</Label>
          <Input
            id="cargo"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            placeholder="Ingrese su cargo"
            disabled={readOnly}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
