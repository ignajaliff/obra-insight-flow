
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateChange: (start: Date | undefined, end: Date | undefined) => void;
}

export function DateRangeFilter({ startDate, endDate, onDateChange }: DateRangeFilterProps) {
  const [date, setDate] = React.useState<Date>();
  const [isStartDate, setIsStartDate] = React.useState(true);

  // Reset the selection when the popover opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsStartDate(true);
    }
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    
    if (isStartDate) {
      setDate(selectedDate);
      onDateChange(selectedDate, endDate);
      setIsStartDate(false);
    } else {
      // Make sure endDate is after startDate
      if (startDate && selectedDate < startDate) {
        // If selecting end date before start date, swap them
        onDateChange(selectedDate, startDate);
      } else {
        onDateChange(startDate, selectedDate);
      }
    }
  };

  const handleToday = () => {
    const today = new Date();
    onDateChange(today, today);
  };

  const handleLastWeek = () => {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    onDateChange(lastWeek, today);
  };

  const handleLastMonth = () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    onDateChange(lastMonth, today);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Popover onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate && endDate ? (
              <>
                {format(startDate, 'PP')} - {format(endDate, 'PP')}
              </>
            ) : (
              "Seleccionar fechas"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
          <div className="flex justify-between px-4 py-2 border-t">
            <div className="text-sm font-medium">
              {isStartDate ? "Seleccione fecha inicial" : "Seleccione fecha final"}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button variant="outline" onClick={handleToday} size="sm">Hoy</Button>
      <Button variant="outline" onClick={handleLastWeek} size="sm">Últimos 7 días</Button>
      <Button variant="outline" onClick={handleLastMonth} size="sm">Últimos 30 días</Button>
    </div>
  );
}
