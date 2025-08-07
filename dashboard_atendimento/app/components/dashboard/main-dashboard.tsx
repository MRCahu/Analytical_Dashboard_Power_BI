
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import KPICard from '@/components/ui/kpi-card';
import FilterPanel from '@/components/dashboard/filter-panel';
import TicketsTrendChart from '@/components/charts/tickets-trend-chart';
import TicketsByDepartmentChart from '@/components/charts/tickets-by-department-chart';
import TicketsByStatusChart from '@/components/charts/tickets-by-status-chart';
import { 
  DashboardData, 
  FilterState, 
  KPIData 
} from '@/lib/types';
import { 
  loadDashboardData,
  calculateKPIs,
  getTicketsByDepartment,
  getTicketsByStatus,
  getTicketTrend,
  formatTime,
  formatPercentage
} from '@/lib/data-utils';
import {
  Ticket,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';

export default function MainDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    periodo: {
      inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      fim: new Date()
    },
    agentes: [],
    departamentos: [],
    status: [],
    prioridades: [],
    canais: []
  });

  const [kpis, setKpis] = useState<KPIData>({
    totalTickets: 0,
    ticketsResolvidos: 0,
    taxaResolucao: 0,
    tempoMedioResposta: 0,
    tempoMedioResolucao: 0,
    satisfacaoMedia: 0,
    ticketsAbertos: 0,
    ticketsVencidos: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (data?.tickets) {
      const newKpis = calculateKPIs(data.tickets, filters);
      setKpis(newKpis);
    }
  }, [data, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await loadDashboardData();
      setData(dashboardData);
    } catch (err) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: 'Dashboard de Atendimento',
          text: 'Confira os dados do dashboard de atendimento ao cliente',
          url: window?.location?.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleExport = () => {
    // Implementação básica de exportação
    const exportData = {
      kpis,
      filtros: filters,
      data_exportacao: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-atendimento-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Erro ao carregar dados
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">{error}</p>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const ticketsByDepartment = getTicketsByDepartment(data?.tickets ?? []);
  const ticketsByStatus = getTicketsByStatus(data?.tickets ?? []);
  const ticketTrend = getTicketTrend(data?.tickets ?? [], 30);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Dashboard de Atendimento
          </h1>
          <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {data?.metadata?.total_registros?.tickets?.toLocaleString?.('pt-BR') ?? '0'} tickets
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {data?.metadata?.total_registros?.agentes ?? 0} agentes
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {data?.metadata?.total_registros?.departamentos ?? 0} departamentos
            </Badge>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="border-slate-300 hover:bg-slate-50"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Compartilhar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-slate-300 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-slate-300 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <FilterPanel
        agentes={data?.agentes ?? []}
        departamentos={Object?.keys?.(data?.configuracao?.departamentos ?? {}) ?? []}
        status={data?.configuracao?.status_possiveis ?? []}
        prioridades={data?.configuracao?.prioridades ?? []}
        canais={data?.configuracao?.canais_atendimento ?? []}
        onFilterChange={setFilters}
        initialFilters={filters}
        className="mb-8"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total de Tickets"
          value={kpis?.totalTickets?.toLocaleString?.('pt-BR') ?? '0'}
          subtitle="Todos os tickets"
          icon={Ticket}
          color="blue"
        />
        <KPICard
          title="Taxa de Resolução"
          value={formatPercentage(kpis?.taxaResolucao ?? 0)}
          subtitle={`${kpis?.ticketsResolvidos?.toLocaleString?.('pt-BR') ?? '0'} resolvidos`}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Tempo Médio de Resposta"
          value={formatTime(kpis?.tempoMedioResposta ?? 0)}
          subtitle="Primeira resposta"
          icon={Clock}
          color="orange"
        />
        <KPICard
          title="Satisfação Média"
          value={kpis?.satisfacaoMedia?.toFixed?.(1) ?? '0.0'}
          subtitle="de 5.0 estrelas"
          icon={Star}
          color="purple"
        />
        <KPICard
          title="Tickets Abertos"
          value={kpis?.ticketsAbertos?.toLocaleString?.('pt-BR') ?? '0'}
          subtitle="Aguardando atendimento"
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          title="Tickets Vencidos"
          value={kpis?.ticketsVencidos?.toLocaleString?.('pt-BR') ?? '0'}
          subtitle="+24h sem resposta"
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          title="Tempo de Resolução"
          value={formatTime(kpis?.tempoMedioResolucao ?? 0)}
          subtitle="Média de resolução"
          icon={Clock}
          color="blue"
        />
        <KPICard
          title="Agentes Ativos"
          value={data?.agentes?.filter?.(a => a?.ativo)?.length?.toString?.() ?? '0'}
          subtitle="Disponíveis"
          icon={Users}
          color="green"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TicketsByDepartmentChart data={ticketsByDepartment} />
        <TicketsByStatusChart data={ticketsByStatus} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TicketsTrendChart data={ticketTrend} />
      </div>
    </div>
  );
}
