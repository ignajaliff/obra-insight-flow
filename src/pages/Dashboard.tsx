
import React, { useState } from 'react';
import { FileText, CheckSquare, AlertTriangle, BarChart2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { BarChart } from '@/components/dashboard/BarChart';
import { PieChart } from '@/components/dashboard/PieChart';
import { DateRangeFilter } from '@/components/dashboard/DateRangeFilter';
import { FormTypesFilter, FORM_TYPES } from '@/components/forms/FormTypesFilter';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NegativeEventFilter } from '@/components/forms/NegativeEventFilter';

// Datos de muestra por tipo de formulario
const formDataByType = {
  'Inspección de seguridad': {
    byDay: [
      { name: 'Lunes', formularios: 10 },
      { name: 'Martes', formularios: 15 },
      { name: 'Miércoles', formularios: 12 },
      { name: 'Jueves', formularios: 18 },
      { name: 'Viernes', formularios: 14 },
      { name: 'Sábado', formularios: 8 },
      { name: 'Domingo', formularios: 5 },
    ],
    stats: {
      total: 82,
      eventos: 12,
      revisados: 78,
      pendientes: 4,
    },
    distribution: [
      { name: 'Completos', value: 65 },
      { name: 'Con observaciones', value: 12 },
      { name: 'Incompletos', value: 5 },
    ],
  },
  'Reporte diario': {
    byDay: [
      { name: 'Lunes', formularios: 20 },
      { name: 'Martes', formularios: 22 },
      { name: 'Miércoles', formularios: 18 },
      { name: 'Jueves', formularios: 25 },
      { name: 'Viernes', formularios: 23 },
      { name: 'Sábado', formularios: 12 },
      { name: 'Domingo', formularios: 5 },
    ],
    stats: {
      total: 125,
      eventos: 18,
      revisados: 110,
      pendientes: 15,
    },
    distribution: [
      { name: 'Asistencia completa', value: 85 },
      { name: 'Ausencias', value: 25 },
      { name: 'Retrasos', value: 15 },
    ],
  },
  'Control de calidad': {
    byDay: [
      { name: 'Lunes', formularios: 8 },
      { name: 'Martes', formularios: 10 },
      { name: 'Miércoles', formularios: 7 },
      { name: 'Jueves', formularios: 12 },
      { name: 'Viernes', formularios: 9 },
      { name: 'Sábado', formularios: 5 },
      { name: 'Domingo', formularios: 0 },
    ],
    stats: {
      total: 51,
      eventos: 8,
      revisados: 45,
      pendientes: 6,
    },
    distribution: [
      { name: 'Aprobados', value: 40 },
      { name: 'Rechazados', value: 8 },
      { name: 'En revisión', value: 3 },
    ],
  },
  'Incidentes': {
    byDay: [
      { name: 'Lunes', formularios: 2 },
      { name: 'Martes', formularios: 1 },
      { name: 'Miércoles', formularios: 3 },
      { name: 'Jueves', formularios: 0 },
      { name: 'Viernes', formularios: 2 },
      { name: 'Sábado', formularios: 1 },
      { name: 'Domingo', formularios: 0 },
    ],
    stats: {
      total: 9,
      eventos: 9,
      revisados: 7,
      pendientes: 2,
    },
    distribution: [
      { name: 'Leves', value: 5 },
      { name: 'Moderados', value: 3 },
      { name: 'Graves', value: 1 },
    ],
  },
  'Entrega de EPP': {
    byDay: [
      { name: 'Lunes', formularios: 15 },
      { name: 'Martes', formularios: 5 },
      { name: 'Miércoles', formularios: 8 },
      { name: 'Jueves', formularios: 12 },
      { name: 'Viernes', formularios: 10 },
      { name: 'Sábado', formularios: 0 },
      { name: 'Domingo', formularios: 0 },
    ],
    stats: {
      total: 50,
      eventos: 3,
      revisados: 45,
      pendientes: 5,
    },
    distribution: [
      { name: 'Casco', value: 20 },
      { name: 'Guantes', value: 15 },
      { name: 'Otros', value: 15 },
    ],
  },
};

// Colores para los gráficos de pie
const colorsPie = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard = () => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedFormType, setSelectedFormType] = useState<string>(FORM_TYPES[0]);
  const [negativeEventFilter, setNegativeEventFilter] = useState<'all' | 'yes' | 'no'>('all');

  const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
    if (start) setStartDate(start);
    if (end) setEndDate(end);
  };

  const currentData = formDataByType[selectedFormType as keyof typeof formDataByType];
  
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
          <NegativeEventFilter 
            value={negativeEventFilter}
            onChange={setNegativeEventFilter}
          />
        </div>
      </div>
      
      <Tabs defaultValue={FORM_TYPES[0]} onValueChange={setSelectedFormType}>
        <TabsList className="w-full flex justify-start mb-4 overflow-x-auto">
          {FORM_TYPES.map((type) => (
            <TabsTrigger key={type} value={type} className="whitespace-nowrap">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>

        {FORM_TYPES.map((type) => {
          const typeData = formDataByType[type as keyof typeof formDataByType];
          return (
            <TabsContent key={type} value={type} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Formularios"
                  value={typeData.stats.total}
                  description="Últimos 7 días"
                  icon={<FileText />}
                  trend={{ value: 12, positive: true }}
                />
                <StatCard
                  title="Eventos Negativos"
                  value={typeData.stats.eventos}
                  description={`${Math.round(typeData.stats.eventos / typeData.stats.total * 100)}% del total`}
                  icon={<AlertTriangle className="text-danger-500" />}
                  trend={{ value: 2, positive: false }}
                />
                <StatCard
                  title="Revisados"
                  value={typeData.stats.revisados}
                  description={`${Math.round(typeData.stats.revisados / typeData.stats.total * 100)}% del total`}
                  icon={<CheckSquare className="text-green-500" />}
                  trend={{ value: 8, positive: true }}
                />
                <StatCard
                  title="Pendientes"
                  value={typeData.stats.pendientes}
                  description={`${Math.round(typeData.stats.pendientes / typeData.stats.total * 100)}% del total`}
                  icon={<BarChart2 />}
                  trend={{ value: 5, positive: false }}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <BarChart 
                  data={typeData.byDay} 
                  title="Formularios por día" 
                  dataKey="formularios" 
                  xAxisKey="name"
                />
                <PieChart 
                  data={typeData.distribution} 
                  title={`Distribución de ${type}`} 
                  dataKey="value"
                  nameKey="name"
                  colors={colorsPie}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

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
