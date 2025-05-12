
import React from 'react';
import { FileText, CheckSquare, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

interface FormStats {
  total: number;
  positivos: number;
  negativos: number;
}

export function FormStatsSection({ stats }: { stats: FormStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard 
        title="Total Formularios" 
        value={stats.total} 
        description="Último período" 
        icon={<FileText />} 
      />
      <StatCard 
        title="Todo positivo" 
        value={stats.positivos} 
        description={`${Math.round(stats.total > 0 ? stats.positivos / stats.total * 100 : 0)}% del total`} 
        icon={<CheckSquare className="text-green-500" />} 
      />
      <StatCard 
        title="Con items negativos" 
        value={stats.negativos} 
        description={`${Math.round(stats.total > 0 ? stats.negativos / stats.total * 100 : 0)}% del total`} 
        icon={<AlertTriangle className="text-red-500" />} 
      />
    </div>
  );
}
