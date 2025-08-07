
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KPICard from '@/components/ui/kpi-card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardData } from '@/lib/types';
import { loadDashboardData, getTicketsByDepartment } from '@/lib/data-utils';
import {
  Building2,
  Users,
  Ticket,
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function DepartamentosPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const dashboardData = await loadDashboardData();
      setData(dashboardData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const departamentos = Object?.entries?.(data?.configuracao?.departamentos ?? {}) ?? [];
  const ticketsByDepartment = getTicketsByDepartment(data?.tickets ?? []);
  
  const getDepartmentAgents = (deptName: string) => {
    return data?.agentes?.filter?.(a => a?.departamento === deptName) ?? [];
  };

  const getComplexityColor = (complexity: string) => {
    const colors: Record<string, string> = {
      'baixo': 'bg-green-100 text-green-800',
      'medio': 'bg-yellow-100 text-yellow-800',
      'alto': 'bg-red-100 text-red-800'
    };
    return colors[complexity] ?? 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Departamentos
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Análise e performance por departamento
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total de Departamentos"
          value={departamentos?.length?.toString?.() ?? '0'}
          subtitle="Ativos"
          icon={Building2}
          color="blue"
        />
        <KPICard
          title="Agentes no Total"
          value={data?.agentes?.length?.toString?.() ?? '0'}
          subtitle="Distribuídos"
          icon={Users}
          color="green"
        />
        <KPICard
          title="Tickets Processados"
          value={data?.tickets?.length?.toLocaleString?.('pt-BR') ?? '0'}
          subtitle="Total histórico"
          icon={Ticket}
          color="purple"
        />
        <KPICard
          title="Tempo Médio Geral"
          value={`${Math?.round?.(departamentos?.reduce?.((acc, [_, dept]) => acc + (dept?.tempo_medio_resolucao ?? 0), 0) / (departamentos?.length ?? 1)) ?? 0}min`}
          subtitle="Resolução"
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Department Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Tickets por Departamento
            </h3>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketsByDepartment} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <XAxis 
                  dataKey="name"
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  label={{ 
                    value: 'Departamento', 
                    position: 'insideBottom', 
                    offset: -15, 
                    style: { textAnchor: 'middle', fontSize: 11 } 
                  }}
                />
                <YAxis 
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  label={{ 
                    value: 'Tickets', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle', fontSize: 11 } 
                  }}
                />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar 
                  dataKey="value" 
                  fill="#60B5FF"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Estatísticas por Departamento
            </h3>
          </div>
          <div className="space-y-4">
            {ticketsByDepartment?.slice?.(0, 5)?.map?.((dept, index) => (
              <div key={dept?.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold`} 
                       style={{ backgroundColor: ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#80D8C3'][index] || '#60B5FF' }}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {dept?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {dept?.percentage}% do total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {dept?.value?.toLocaleString?.('pt-BR') ?? '0'}
                  </p>
                  <p className="text-sm text-slate-500">tickets</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departamentos?.map?.(([deptName, deptInfo]) => {
          const agents = getDepartmentAgents(deptName);
          const deptTickets = ticketsByDepartment?.find?.(d => d?.name === deptName);
          
          return (
            <Card key={deptName} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {deptName}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {deptInfo?.codigo}
                  </p>
                </div>
                <Badge className={getComplexityColor(deptInfo?.nivel_complexidade ?? '')}>
                  {deptInfo?.nivel_complexidade}
                </Badge>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {deptInfo?.descricao}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {agents?.length ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">Agentes</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <Ticket className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {deptTickets?.value ?? 0}
                  </p>
                  <p className="text-xs text-slate-500">Tickets</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-500">Tempo médio de resolução:</span>
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                  {deptInfo?.tempo_medio_resolucao ?? 0} minutos
                </p>
              </div>

              {agents?.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
                  <p className="text-sm text-slate-500 mb-2">Agentes:</p>
                  <div className="flex flex-wrap gap-1">
                    {agents?.slice?.(0, 3)?.map?.(agent => (
                      <Badge key={agent?.id} variant="outline" className="text-xs">
                        {agent?.nome?.split?.(' ')?.[0] ?? agent?.nome}
                      </Badge>
                    ))}
                    {agents?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{agents.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
