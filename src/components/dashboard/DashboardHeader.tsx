
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';

interface DashboardHeaderProps {
  startDate: Date;
  endDate: Date;
  onDateChange: (start: Date | undefined, end: Date | undefined) => void;
  onRefresh: () => void;
  loading: boolean;
  lastUpdated: Date;
  totalRecords: number;
  showAllDates: boolean;
  onToggleShowAllDates: () => void;
}

export function DashboardHeader({
  startDate,
  endDate,
  onDateChange,
  onRefresh,
  loading,
  lastUpdated,
  totalRecords,
  showAllDates,
  onToggleShowAllDates
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between flex-wrap gap-4">
      <div>
        <p className="text-muted-foreground">Resumen de los formularios recibidos</p>
        <p className="text-xs text-muted-foreground">Última actualización: {lastUpdated.toLocaleTimeString()}</p>
        <p className="text-xs text-muted-foreground">Total registros disponibles: {totalRecords}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={onRefresh}
          variant="outline"
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refrescar datos
        </Button>
        <DateRangeFilter 
          startDate={startDate} 
          endDate={endDate} 
          onDateChange={onDateChange}
          showAllDates={showAllDates}
          onToggleShowAllDates={onToggleShowAllDates}
        />
      </div>
    </div>
  );
}
