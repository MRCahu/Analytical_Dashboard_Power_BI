
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import KPICard from '@/components/ui/kpi-card';
import { DashboardData, Ticket } from '@/lib/types';
import { loadDashboardData, formatTime } from '@/lib/data-utils';
import {
  Ticket as TicketIcon,
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Calendar
} from 'lucide-react';

export default function TicketsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredTickets = data?.tickets?.filter?.(ticket => {
    const matchesSearch = ticket?.titulo?.toLowerCase?.()?.includes?.(searchTerm?.toLowerCase?.() ?? '') ||
                         ticket?.agente_nome?.toLowerCase?.()?.includes?.(searchTerm?.toLowerCase?.() ?? '');
    const matchesStatus = statusFilter === 'all' || ticket?.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) ?? [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Aberto': 'bg-red-100 text-red-800',
      'Em Andamento': 'bg-yellow-100 text-yellow-800',
      'Resolvido': 'bg-green-100 text-green-800',
      'Fechado': 'bg-gray-100 text-gray-800',
      'Aguardando Cliente': 'bg-blue-100 text-blue-800',
      'Aguardando Terceiros': 'bg-purple-100 text-purple-800',
      'Cancelado': 'bg-gray-100 text-gray-800'
    };
    return colors[status] ?? 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Crítica': 'bg-red-100 text-red-800 border-red-200',
      'Alta': 'bg-orange-100 text-orange-800 border-orange-200',
      'Normal': 'bg-blue-100 text-blue-800 border-blue-200',
      'Baixa': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[priority] ?? 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Gestão de Tickets
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Visualize e gerencie todos os tickets de atendimento
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total de Tickets"
          value={filteredTickets?.length?.toLocaleString?.('pt-BR') ?? '0'}
          subtitle="Filtrados"
          icon={TicketIcon}
          color="blue"
        />
        <KPICard
          title="Tickets Abertos"
          value={filteredTickets?.filter?.(t => t?.status === 'Aberto')?.length?.toString?.() ?? '0'}
          subtitle="Aguardando atendimento"
          icon={AlertCircle}
          color="red"
        />
        <KPICard
          title="Em Andamento"
          value={filteredTickets?.filter?.(t => t?.status === 'Em Andamento')?.length?.toString?.() ?? '0'}
          subtitle="Sendo atendidos"
          icon={Clock}
          color="orange"
        />
        <KPICard
          title="Resolvidos"
          value={filteredTickets?.filter?.(t => t?.status === 'Resolvido')?.length?.toString?.() ?? '0'}
          subtitle="Concluídos"
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value ?? '')}
                className="pl-9"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e?.target?.value ?? 'all')}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              {data?.configuracao?.status_possiveis?.map?.(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Lista de Tickets ({filteredTickets?.length?.toLocaleString?.('pt-BR') ?? '0'})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Agente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tempo Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredTickets?.slice?.(0, 100)?.map?.((ticket) => (
                  <tr key={ticket?.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          #{ticket?.numero_ticket}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {ticket?.titulo}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {ticket?.categoria}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={getStatusColor(ticket?.status ?? '')}>
                        {ticket?.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={getPriorityColor(ticket?.prioridade ?? '')}>
                        {ticket?.prioridade}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900 dark:text-white">
                          {ticket?.agente_nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900 dark:text-white">
                          {new Date(ticket?.data_abertura ?? '')?.toLocaleDateString?.('pt-BR') ?? 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-900 dark:text-white">
                          {formatTime(ticket?.tempo_total_minutos ?? 0)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTickets?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Nenhum ticket encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
