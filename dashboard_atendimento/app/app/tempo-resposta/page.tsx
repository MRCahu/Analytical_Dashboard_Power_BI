
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KPICard from '@/components/ui/kpi-card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { DashboardData } from '@/lib/types';
import { loadDashboardData, formatTime, getTicketTrend } from '@/lib/data-utils';
import {
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Zap,
  Timer
} from 'lucide-react';

export default function TempoRespostaPage() {
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

  const ticketsComResposta = data?.tickets?.filter?.(t => t?.tempo_primeira_resposta_minutos != null) ?? [];
  const ticketsResolvidos = data?.tickets?.filter?.(t => t?.tempo_resolucao_minutos != null) ?? [];
  
  const tempoMedioResposta = ticketsComResposta?.reduce?.((acc, t) => acc + (t?.tempo_primeira_resposta_minutos ?? 0), 0) / (ticketsComResposta?.length ?? 1);
  const tempoMedioResolucao = ticketsResolvidos?.reduce?.((acc, t) => acc + (t?.tempo_resolucao_minutos ?? 0), 0) / (ticketsResolvidos?.length ?? 1);
  
  // Tickets por faixa de tempo de resposta
  const faixasResposta = [
    { nome: '0-30min', min: 0, max: 30 },
    { nome: '30-60min', min: 30, max: 60 },
    { nome: '1-2h', min: 60, max: 120 },
    { nome: '2-4h', min: 120, max: 240 },
    { nome: '+4h', min: 240, max: Infinity }
  ];

  const ticketsPorFaixa = faixasResposta?.map?.(faixa => {
    const count = ticketsComResposta?.filter?.(t => 
      (t?.tempo_primeira_resposta_minutos ?? 0) >= faixa.min && 
      (t?.tempo_primeira_resposta_minutos ?? 0) < faixa.max
    )?.length ?? 0;
    
    return {
      name: faixa.nome,
      value: count,
      percentage: ((count / (ticketsComResposta?.length ?? 1)) * 100)?.toFixed?.(1) ?? '0.0'
    };
  }) ?? [];

  // Média por departamento
  const temposPorDepartamento = Object?.entries?.(
    data?.tickets?.reduce?.((acc, ticket) => {
      const dept = ticket?.categoria ?? 'Outros';
      if (!acc[dept]) {
        acc[dept] = { tempos: [], count: 0 };
      }
      if (ticket?.tempo_primeira_resposta_minutos != null) {
        acc[dept].tempos.push(ticket.tempo_primeira_resposta_minutos);
        acc[dept].count++;
      }
      return acc;
    }, {} as Record<string, { tempos: number[], count: number }>) ?? {}
  )?.map?.(([dept, info]) => ({
    name: dept,
    tempoMedio: info.tempos?.reduce?.((a, b) => a + b, 0) / (info.tempos?.length ?? 1),
    tickets: info.count
  })) ?? [];

  const ticketsVencidos = data?.tickets?.filter?.(ticket => {
    if (ticket?.status === 'Resolvido' || ticket?.status === 'Fechado') return false;
    const abertura = new Date(ticket?.data_abertura ?? '');
    const agora = new Date();
    const horasAbertas = (agora.getTime() - abertura.getTime()) / (1000 * 60 * 60);
    return horasAbertas > 24;
  })?.length ?? 0;

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Tempo de Resposta & SLA
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Análise dos tempos de resposta e resolução
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Tempo Médio de Resposta"
          value={formatTime(tempoMedioResposta)}
          subtitle="Primeira resposta"
          icon={Zap}
          color="blue"
        />
        <KPICard
          title="Tempo Médio de Resolução"
          value={formatTime(tempoMedioResolucao)}
          subtitle="Resolução completa"
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Tickets Vencidos"
          value={ticketsVencidos?.toString?.() ?? '0'}
          subtitle="+24h sem resposta"
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          title="Taxa de Resposta"
          value={`${((ticketsComResposta?.length / (data?.tickets?.length ?? 1)) * 100)?.toFixed?.(1) ?? '0.0'}%`}
          subtitle="Tickets respondidos"
          icon={Timer}
          color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tickets por Faixa de Tempo */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Distribuição por Tempo de Resposta
            </h3>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketsPorFaixa} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                  dataKey="name"
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  label={{ 
                    value: 'Tempo', 
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
                <Tooltip 
                  formatter={(value: number, name: string, props) => [
                    `${value} tickets (${props?.payload?.percentage}%)`,
                    'Quantidade'
                  ]}
                  contentStyle={{ fontSize: 11 }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#60B5FF"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tempo por Departamento */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Tempo Médio por Departamento
            </h3>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={temposPorDepartamento} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
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
                    value: 'Tempo (min)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle', fontSize: 11 } 
                  }}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `${Math?.round?.(value) ?? 0} minutos`,
                    'Tempo Médio'
                  ]}
                  contentStyle={{ fontSize: 11 }}
                />
                <Bar 
                  dataKey="tempoMedio" 
                  fill="#FF9149"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Performance por Faixa */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Timer className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Performance por Faixa de Tempo
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {ticketsPorFaixa?.map?.((faixa, index) => {
            const colors = ['bg-green-50 border-green-200', 'bg-blue-50 border-blue-200', 'bg-yellow-50 border-yellow-200', 'bg-orange-50 border-orange-200', 'bg-red-50 border-red-200'];
            const textColors = ['text-green-800', 'text-blue-800', 'text-yellow-800', 'text-orange-800', 'text-red-800'];
            
            return (
              <div key={faixa?.name} className={`p-4 rounded-lg border-2 ${colors[index]} ${textColors[index]}`}>
                <div className="text-center">
                  <h4 className="text-sm font-medium mb-2">{faixa?.name}</h4>
                  <p className="text-2xl font-bold mb-1">{faixa?.value}</p>
                  <p className="text-sm">tickets</p>
                  <Badge className={`mt-2 ${colors[index]} ${textColors[index]} border-0`}>
                    {faixa?.percentage}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
