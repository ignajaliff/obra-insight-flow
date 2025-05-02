
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

export interface FormEntry {
  id: string;
  workerName: string;
  formType: string;
  date: string;
  hasNegativeEvent: boolean;
  driveLink: string;
  reviewStatus: 'reviewed' | 'pending';
}

interface FormsTableProps {
  forms: FormEntry[];
}

export function FormsTable({ forms }: FormsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Obrero</TableHead>
            <TableHead>Tipo de formulario</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Evento Negativo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Documento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No se encontraron resultados.
              </TableCell>
            </TableRow>
          ) : (
            forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell className="font-medium">{form.workerName}</TableCell>
                <TableCell>{form.formType}</TableCell>
                <TableCell>{form.date}</TableCell>
                <TableCell>
                  {form.hasNegativeEvent ? (
                    <Badge variant="destructive">Sí</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={form.reviewStatus === 'reviewed' ? 'secondary' : 'outline'}>
                    {form.reviewStatus === 'reviewed' ? 'Revisado' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <a
                    href={form.driveLink}
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
