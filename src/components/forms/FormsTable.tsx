
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Link, FileText } from 'lucide-react';
import { FormResponse } from '@/types/forms';

interface FormsTableProps {
  forms: FormResponse[];
  showCompany?: boolean;
}

export function FormsTable({ forms, showCompany = true }: FormsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Obrero</TableHead>
            <TableHead>Tipo de formulario</TableHead>
            {showCompany && <TableHead>Empresa</TableHead>}
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Documento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showCompany ? 6 : 5} className="h-24 text-center">
                No se encontraron resultados.
              </TableCell>
            </TableRow>
          ) : (
            forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell className="font-medium">{form.worker_name}</TableCell>
                <TableCell>{form.form_type}</TableCell>
                {showCompany && (
                  <TableCell>
                    {form.empresa || <span className="text-muted-foreground italic">No asignada</span>}
                  </TableCell>
                )}
                <TableCell>{new Date(form.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={form.status === 'Todo positivo' ? 'outline' : 'destructive'}>
                    {form.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <a
                    href={form.document_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-700 hover:text-brand-800"
                  >
                    <FileText size={16} />
                    <span className="underline">Ver</span>
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
