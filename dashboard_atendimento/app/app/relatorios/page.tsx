
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import KPICard from '@/components/ui/kpi-card';
import { DashboardData } from '@/lib/types';
import { loadDashboardData, formatTime, formatPercentage, calculateKPIs } from '@/lib/data-utils';
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function RelatoriosPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);

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

  const generateReport = async (type: string) => {
    if (!data) return;
    
    setGeneratingReport(true);
    
    try {
      const kpis = calculateKPIs(data?.tickets ?? []);
      const reportData = {
        tipo: type,
        data_geracao: new Date().toISOString(),
        periodo: data?.metadata?.periodo_dados,
        resumo_executivo: {
          total_tickets: kpis.totalTickets,
          taxa_resolucao: kpis.taxaResolucao,
          tempo_medio_resposta: kpis.tempoMedioResposta,
          satisfacao_media: kpis.satisfacaoMedia,
          agentes_ativos: data?.agentes?.filter?.(a => a?.ativo)?.length ?? 0
        },
        detalhes: {
          tickets_por_departamento: data?.tickets?.reduce?.((acc, t) => {
            const dept = t?.categoria ?? 'Outros';
            acc[dept] = (acc[dept] ?? 0) + 1;
            return acc;
          }, {} as Record<string, number>) ?? {},
          
          tickets_por_status: data?.tickets?.reduce?.((acc, t) => {
            const status = t?.status ?? 'Desconhecido';
            acc[status] = (acc[status] ?? 0) + 1;
            return acc;
          }, {} as Record<string, number>) ?? {},
          
          performance_agentes: data?.agentes?.map?.(agente => {
            const agentTickets = data?.tickets?.filter?.(t => t?.agente_id === agente?.id) ?? [];
            const resolvedTickets = agentTickets?.filter?.(t => t?.status === 'Resolvido' || t?.status === 'Fechado') ?? [];
            
            return {
              nome: agente?.nome,
              departamento: agente?.departamento,
              tickets_atendidos: agentTickets?.length ?? 0,
              tickets_resolvidos: resolvedTickets?.length ?? 0,
              taxa_resolucao: agentTickets?.length > 0 ? (resolvedTickets?.length / agentTickets?.length) * 100 : 0,
              meta_diaria: agente?.meta_tickets_dia,
              meta_satisfacao: agente?.meta_satisfacao
            };
          }) ?? []
        }
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${type.toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setGeneratingReport(false);
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

  const kpis = calculateKPIs(data?.tickets ?? []);
  const agentesAtivos = data?.agentes?.filter?.(a => a?.ativo)?.length ?? 0;

  const reportTypes = [
    {
      title: 'Relatório Executivo',
      description: 'Visão geral com principais KPIs e métricas de performance',
      icon: BarChart3,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      type: 'executivo'
    },
    {
      title: 'Relatório de Performance',
      description: 'Análise detalhada da performance dos agentes e departamentos',
      icon: TrendingUp,
      color: 'bg-green-50 border-green-200 text-green-800',
      type: 'performance'
    },
    {
      title: 'Relatório de Tickets',
      description: 'Detalhamento completo dos tickets por status, prioridade e categoria',
      icon: FileText,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      type: 'tickets'
    },
    {
      title: 'Relatório de Agentes',
      description: 'Informações detalhadas sobre agentes, metas e produtividade',
      icon: Users,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
      type: 'agentes'
    }
  ];

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Relatórios e Análises
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Gere relatórios detalhados sobre performance e métricas
          </p>
        </div>
      </div>

      {/* KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Período de Dados"
          value={`${Math.ceil((new Date(data?.metadata?.periodo_dados?.fim ?? '').getTime() - new Date(data?.metadata?.periodo_dados?.inicio ?? '').getTime()) / (1000 * 60 * 60 * 24))}`}
          subtitle="dias analisados"
          icon={Calendar}
          color="blue"
        />
        <KPICard
          title="Total de Tickets"
          value={kpis?.totalTickets?.toLocaleString?.('pt-BR') ?? '0'}
          subtitle="no período"
          icon={FileText}
          color="green"
        />
        <KPICard
          title="Agentes Ativos"
          value={agentesAtivos?.toString?.() ?? '0'}
          subtitle="disponíveis"
          icon={Users}
          color="purple"
        />
        <KPICard
          title="Taxa de Resolução"
          value={formatPercentage(kpis?.taxaResolucao ?? 0)}
          subtitle="tickets resolvidos"
          icon={CheckCircle}
          color="orange"
        />
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {reportTypes?.map?.((report) => {
          const Icon = report?.icon;
          return (
            <Card key={report?.type} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${report?.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {report?.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {report?.description}
                  </p>
                  <Button
                    onClick={() => generateReport(report?.type)}
                    disabled={generatingReport}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {generatingReport ? 'Gerando...' : 'Gerar Relatório'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Resumo Rápido - Últimos Dados
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {formatTime(kpis?.tempoMedioResposta ?? 0)}
            </p>
            <p className="text-sm text-slate-500">Tempo Médio de Resposta</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {kpis?.ticketsResolvidos?.toLocaleString?.('pt-BR') ?? '0'}
            </p>
            <p className="text-sm text-slate-500">Tickets Resolvidos</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {kpis?.satisfacaoMedia?.toFixed?.(2) ?? '0.00'}
            </p>
            <p className="text-sm text-slate-500">Satisfação Média</p>
          </div>
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Users className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {data?.metadata?.total_registros?.departamentos ?? 0}
            </p>
            <p className="text-sm text-slate-500">Departamentos</p>
          </div>
        </div>
      </Card>

      {/* Report Info */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Informações dos Relatórios
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Formato dos Dados</h4>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• Formato: JSON estruturado</li>
              <li>• Codificação: UTF-8</li>
              <li>• Dados em tempo real</li>
              <li>• Métricas calculadas automaticamente</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Período de Dados</h4>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <p>• Início: {new Date(data?.metadata?.periodo_dados?.inicio ?? '')?.toLocaleDateString?.('pt-BR') ?? 'N/A'}</p>
              <p>• Fim: {new Date(data?.metadata?.periodo_dados?.fim ?? '')?.toLocaleDateString?.('pt-BR') ?? 'N/A'}</p>
              <p>• Última atualização: {new Date()?.toLocaleDateString?.('pt-BR') ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
