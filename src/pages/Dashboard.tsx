
import React, { useState } from 'react';
import { FileText, CheckSquare, AlertTriangle, BarChart2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart } from '@/components/dashboard/BarChart';
import { PieChart } from '@/components/dashboard/PieChart';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { FormTypesFilter, FORM_TYPES } from '@/components/forms/FormTypesFilter';
import { Card } from '@/components/ui/card';

// Sample Data
const formsByDayData = [
  { name: 'Lunes', formularios: 30 },
  { name: 'Martes', formularios: 40 },
  { name: 'Miércoles', formularios: 35 },
  { name: 'Jueves', formularios: 55 },
  { name: 'Viernes', formularios: 45 },
  { name: 'Sábado', formularios: 25 },
  { name: 'Domingo', formularios: 10 },
];

const formTypeDistribution = [
  { name: 'Inspección de seguridad', value: 40 },
  { name: 'Reporte diario', value: 55 },
  { name: 'Control de calidad', value: 20 },
  { name: 'Incidentes', value: 15 },
  { name: 'Entrega de EPP', value: 30 },
];

const colorsPie = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedFormTypes, setSelectedFormTypes] = useState<string[]>(FORM_TYPES);

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    if (start) setStartDate(start);
    if (end) setEndDate(end);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de los formularios recibidos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DateRangeFilter 
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
          />
          <FormTypesFilter 
            selectedTypes={selectedFormTypes}
            onSelectionChange={setSelectedFormTypes}
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Formularios"
          value="320"
          description="Últimos 7 días"
          icon={<FileText />}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          title="Eventos Negativos"
          value="45"
          description="14% del total"
          icon={<AlertTriangle className="text-danger-500" />}
          trend={{ value: 2, positive: false }}
        />
        <StatCard
          title="Revisados"
          value="283"
          description="88% del total"
          icon={<CheckSquare className="text-green-500" />}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="Pendientes"
          value="37"
          description="12% del total"
          icon={<BarChart2 />}
          trend={{ value: 5, positive: false }}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <BarChart 
          data={formsByDayData} 
          title="Formularios por día" 
          dataKey="formularios" 
          xAxisKey="name"
        />
        <PieChart 
          data={formTypeDistribution} 
          title="Distribución por tipo de formulario" 
          dataKey="value"
          nameKey="name"
          colors={colorsPie}
        />
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium">¿Necesitas importar nuevos formularios?</h3>
            <p className="text-sm text-muted-foreground">
              Importa formularios desde CSV, Excel o directamente desde JotForm
            </p>
          </div>
          <a href="/importar" className="shrink-0">
            <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded">
              Importar datos
            </button>
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
