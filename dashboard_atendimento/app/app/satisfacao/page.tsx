
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KPICard from '@/components/ui/kpi-card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { DashboardData } from '@/lib/types';
import { loadDashboardData } from '@/lib/data-utils';
import {
  Star,
  TrendingUp,
  MessageSquare,
  ThumbsUp,
  Award,
  Users
} from 'lucide-react';

export default function SatisfacaoPage() {
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

  const ticketsComSatisfacao = data?.tickets?.filter?.(t => t?.satisfacao_cliente != null) ?? [];
  const satisfacaoMedia = ticketsComSatisfacao?.reduce?.((acc, t) => acc + (t?.satisfacao_cliente ?? 0), 0) / (ticketsComSatisfacao?.length ?? 1);
  
  // Distribuição por nota
  const distribuicaoNotas = [1, 2, 3, 4, 5]?.map?.(nota => {
    const count = ticketsComSatisfacao?.filter?.(t => Math.round(t?.satisfacao_cliente ?? 0) === nota)?.length ?? 0;
    return {
      name: `${nota} estrela${nota > 1 ? 's' : ''}`,
      value: count,
      nota: nota,
      percentage: ((count / (ticketsComSatisfacao?.length ?? 1)) * 100)?.toFixed?.(1) ?? '0.0'
    };
  }) ?? [];

  // Satisfação por departamento
  const satisfacaoPorDept = Object?.entries?.(
    data?.tickets?.reduce?.((acc, ticket) => {
      const dept = ticket?.categoria ?? 'Outros';
      if (!acc[dept]) {
        acc[dept] = { satisfacoes: [], count: 0 };
      }
      if (ticket?.satisfacao_cliente != null) {
        acc[dept].satisfacoes.push(ticket.satisfacao_cliente);
        acc[dept].count++;
      }
      return acc;
    }, {} as Record<string, { satisfacoes: number[], count: number }>) ?? {}
  )?.map?.(([dept, info]) => ({
    name: dept,
    satisfacaoMedia: info.satisfacoes?.reduce?.((a, b) => a + b, 0) / (info.satisfacoes?.length ?? 1),
    totalAvaliacoes: info.count
  }))?.sort?.((a, b) => (b?.satisfacaoMedia ?? 0) - (a?.satisfacaoMedia ?? 0)) ?? [];

  // Satisfação por agente
  const satisfacaoPorAgente = Object?.entries?.(
    data?.tickets?.reduce?.((acc, ticket) => {
      const agente = ticket?.agente_nome ?? 'N/A';
      if (!acc[agente]) {
        acc[agente] = { satisfacoes: [], count: 0 };
      }
      if (ticket?.satisfacao_cliente != null) {
        acc[agente].satisfacoes.push(ticket.satisfacao_cliente);
        acc[agente].count++;
      }
      return acc;
    }, {} as Record<string, { satisfacoes: number[], count: number }>) ?? {}
  )?.map?.(([agente, info]) => ({
    nome: agente,
    satisfacaoMedia: info.satisfacoes?.reduce?.((a, b) => a + b, 0) / (info.satisfacoes?.length ?? 1),
    totalAvaliacoes: info.count
  }))?.sort?.((a, b) => (b?.satisfacaoMedia ?? 0) - (a?.satisfacaoMedia ?? 0))?.slice?.(0, 10) ?? [];

  const COLORS = ['#FF6B6B', '#FF9149', '#FFD93D', '#6BCF7F', '#4D96FF'];

  const ticketsExcelentes = ticketsComSatisfacao?.filter?.(t => (t?.satisfacao_cliente ?? 0) >= 4.5)?.length ?? 0;
  const ticketsSatisfatorios = ticketsComSatisfacao?.filter?.(t => (t?.satisfacao_cliente ?? 0) >= 3.5 && (t?.satisfacao_cliente ?? 0) < 4.5)?.length ?? 0;
  const ticketsInsatisfatorios = ticketsComSatisfacao?.filter?.(t => (t?.satisfacao_cliente ?? 0) < 3.5)?.length ?? 0;

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Satisfação do Cliente
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Análise da satisfação e feedback dos clientes
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Satisfação Média"
          value={satisfacaoMedia?.toFixed?.(2) ?? '0.00'}
          subtitle="de 5.0 estrelas"
          icon={Star}
          color="purple"
        />
        <KPICard
          title="Excelente"
          value={ticketsExcelentes?.toString?.() ?? '0'}
          subtitle="≥ 4.5 estrelas"
          icon={Award}
          color="green"
        />
        <KPICard
          title="Total de Avaliações"
          value={ticketsComSatisfacao?.length?.toLocaleString?.('pt-BR') ?? '0'}
          subtitle="Feedback recebido"
          icon={MessageSquare}
          color="blue"
        />
        <KPICard
          title="Taxa de Resposta"
          value={`${((ticketsComSatisfacao?.length / (data?.tickets?.length ?? 1)) * 100)?.toFixed?.(1) ?? '0.0'}%`}
          subtitle="Clientes que avaliaram"
          icon={ThumbsUp}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribuição de Notas */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Distribuição de Notas
            </h3>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <Pie
                  data={distribuicaoNotas}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distribuicaoNotas?.map?.((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} avaliações (${distribuicaoNotas?.find?.(d => d?.name === name)?.percentage ?? '0.0'}%)`,
                    'Quantidade'
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

        {/* Satisfação por Departamento */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Satisfação por Departamento
            </h3>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={satisfacaoPorDept} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
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
                  domain={[0, 5]}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  label={{ 
                    value: 'Satisfação', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle', fontSize: 11 } 
                  }}
                />
                <Tooltip 
                  formatter={(value: number) => [
                    `${value?.toFixed?.(2) ?? '0.00'} estrelas`,
                    'Satisfação Média'
                  ]}
                  contentStyle={{ fontSize: 11 }}
                />
                <Bar 
                  dataKey="satisfacaoMedia" 
                  fill="#60B5FF"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Agentes */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Top 10 Agentes - Satisfação
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {satisfacaoPorAgente?.slice?.(0, 10)?.map?.((agente, index) => (
            <div key={agente?.nome} className="p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border shadow-sm">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">#{index + 1}</span>
                </div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2 text-sm">
                  {agente?.nome?.split?.(' ')?.slice?.(0, 2)?.join?.(' ') ?? agente?.nome}
                </h4>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {agente?.satisfacaoMedia?.toFixed?.(2) ?? '0.00'}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {agente?.totalAvaliacoes} avaliações
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Resumo de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
          <div className="text-center">
            <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              Excelente
            </h3>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
              {ticketsExcelentes}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {((ticketsExcelentes / (ticketsComSatisfacao?.length ?? 1)) * 100)?.toFixed?.(1) ?? '0.0'}% das avaliações
            </p>
            <Badge className="mt-2 bg-green-100 text-green-800 border-green-200">
              ≥ 4.5 estrelas
            </Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
          <div className="text-center">
            <ThumbsUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Satisfatório
            </h3>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              {ticketsSatisfatorios}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {((ticketsSatisfatorios / (ticketsComSatisfacao?.length ?? 1)) * 100)?.toFixed?.(1) ?? '0.0'}% das avaliações
            </p>
            <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-200">
              3.5 - 4.5 estrelas
            </Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Precisa Melhorar
            </h3>
            <p className="text-3xl font-bold text-red-900 dark:text-red-100 mb-2">
              {ticketsInsatisfatorios}
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              {((ticketsInsatisfatorios / (ticketsComSatisfacao?.length ?? 1)) * 100)?.toFixed?.(1) ?? '0.0'}% das avaliações
            </p>
            <Badge className="mt-2 bg-red-100 text-red-800 border-red-200">
              &lt; 3.5 estrelas
            </Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
