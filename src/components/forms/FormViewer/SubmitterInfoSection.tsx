
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubmitterInfoSectionProps {
  submitterName: string;
  setSubmitterName: React.Dispatch<React.SetStateAction<string>>;
  submissionDate: Date;
  setSubmissionDate: React.Dispatch<React.SetStateAction<Date>>;
  readOnly?: boolean;
  isMobile?: boolean;
}

export function SubmitterInfoSection({
  submitterName,
  setSubmitterName,
  submissionDate,
  setSubmissionDate,
  readOnly = false,
  isMobile = false
}: SubmitterInfoSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="submitter-name">Tu nombre</Label>
        <Input
          id="submitter-name"
          value={submitterName}
          onChange={(e) => setSubmitterName(e.target.value)}
          placeholder="Escribe tu nombre completo"
          required
          disabled={readOnly}
          className="w-full"
        />
      </div>
      
      <div>
        <Label htmlFor="submission-date">Fecha de envío</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="submission-date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !submissionDate && "text-muted-foreground"
              )}
              disabled={readOnly}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {submissionDate ? format(submissionDate, 'dd/MM/yyyy', { locale: es }) : "Seleccionar fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align={isMobile ? "center" : "start"} 
            side={isMobile ? "bottom" : "right"}
          >
            <Calendar
              mode="single"
              selected={submissionDate}
              onSelect={(date) => setSubmissionDate(date || new Date())}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
