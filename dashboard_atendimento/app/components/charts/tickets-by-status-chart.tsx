
'use client';

import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertCircle } from 'lucide-react';

interface TicketsByStatusChartProps {
  data: Array<{
    name: string;
    value: number;
    percentage: string;
  }>;
  className?: string;
}

export default function TicketsByStatusChart({ data, className }: TicketsByStatusChartProps) {
  const statusColors: Record<string, string> = {
    'Aberto': '#FF6363',
    'Em Andamento': '#FF9149',
    'Aguardando Cliente': '#FF90BB',
    'Aguardando Terceiros': '#A19AD3',
    'Resolvido': '#72BF78',
    'Fechado': '#80D8C3',
    'Cancelado': '#FF9898'
  };

  const dataWithColors = data?.map?.(item => ({
    ...item,
    fill: statusColors[item?.name ?? ''] ?? '#60B5FF'
  })) ?? [];

  return (
    <Card className={`p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg ${className ?? ''}`}>
      <div className="flex items-center gap-2 mb-6">
        <AlertCircle className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Tickets por Status
        </h3>
      </div>
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={dataWithColors} 
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <XAxis 
              dataKey="name"
              tickLine={false}
              tick={{ fontSize: 10 }}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              label={{ 
                value: 'Status', 
                position: 'insideBottom', 
                offset: -15, 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <YAxis 
              tickLine={false}
              tick={{ fontSize: 10 }}
              axisLine={false}
              label={{ 
                value: 'Quantidade', 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <Tooltip 
              formatter={(value: number, name: string, props) => [
                `${value} tickets (${props?.payload?.percentage ?? '0.0'}%)`,
                'Quantidade'
              ]}
              contentStyle={{ fontSize: 11 }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
