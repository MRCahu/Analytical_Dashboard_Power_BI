
'use client';

import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface TicketsTrendChartProps {
  data: Array<{
    date: string;
    tickets: number;
    dateFormatted: string;
  }>;
  className?: string;
}

export default function TicketsTrendChart({ data, className }: TicketsTrendChartProps) {
  return (
    <Card className={`p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-lg ${className ?? ''}`}>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Tendência de Tickets (Últimos 30 dias)
        </h3>
      </div>
      
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <XAxis 
              dataKey="dateFormatted"
              tickLine={false}
              tick={{ fontSize: 10 }}
              axisLine={false}
              interval="preserveStartEnd"
              label={{ 
                value: 'Data', 
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
                value: 'Tickets', 
                angle: -90, 
                position: 'insideLeft', 
                style: { textAnchor: 'middle', fontSize: 11 } 
              }}
            />
            <Tooltip 
              contentStyle={{ fontSize: 11 }}
            />
            <Line 
              type="monotone" 
              dataKey="tickets" 
              stroke="#60B5FF"
              strokeWidth={3}
              dot={{ fill: '#60B5FF', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#FF9149' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
