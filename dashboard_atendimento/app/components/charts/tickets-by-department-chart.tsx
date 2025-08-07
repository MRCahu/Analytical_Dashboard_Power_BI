
'use client';

import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Building2 } from 'lucide-react';

interface TicketsByDepartmentChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: string;
  }>;
  className?: string;
}

const COLORS = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3', '#A19AD3', '#72BF78'];

export default function TicketsByDepartmentChart({ data, className }: TicketsByDepartmentChartProps) {
  return (
    <Card className={`p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg ${className ?? ''}`}>
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Tickets por Departamento
        </h3>
      </div>
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              paddingAngle={5}
              dataKey="value"
            >
              {data?.map?.((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value} tickets (${data?.find?.(d => d?.name === name)?.percentage ?? '0.0'}%)`,
                'Tickets'
              ]}
              contentStyle={{ fontSize: 11 }}
            />
            <Legend 
              verticalAlign="top"
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
