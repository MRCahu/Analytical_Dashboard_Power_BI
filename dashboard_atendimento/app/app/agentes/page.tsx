
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import KPICard from '@/components/ui/kpi-card';
import { DashboardData, Agente } from '@/lib/types';
import { loadDashboardData } from '@/lib/data-utils';
import {
  Users,
  Star,
  TrendingUp,
  Clock,
  Shield,
  Mail,
  Phone,
  Building2,
  Target
} from 'lucide-react';

export default function AgentesPage() {
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

  const agentesAtivos = data?.agentes?.filter?.(a => a?.ativo) ?? [];
  const supervisores = data?.agentes?.filter?.(a => a?.supervisor) ?? [];
  
  const getExperienceColor = (nivel: string) => {
    const colors: Record<string, string> = {
      'Junior': 'bg-blue-100 text-blue-800',
      'Pleno': 'bg-green-100 text-green-800',
      'Senior': 'bg-purple-100 text-purple-800'
    };
    return colors[nivel] ?? 'bg-gray-100 text-gray-800';
  };

  const getTurnoColor = (turno: string) => {
    const colors: Record<string, string> = {
      'Manhã': 'bg-yellow-100 text-yellow-800',
      'Tarde': 'bg-orange-100 text-orange-800',
      'Noite': 'bg-indigo-100 text-indigo-800'
    };
    return colors[turno] ?? 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Gestão de Agentes
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Performance e informações dos agentes de atendimento
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total de Agentes"
          value={data?.agentes?.length?.toString?.() ?? '0'}
          subtitle="Cadastrados"
          icon={Users}
          color="blue"
        />
        <KPICard
          title="Agentes Ativos"
          value={agentesAtivos?.length?.toString?.() ?? '0'}
          subtitle="Disponíveis"
          icon={Users}
          color="green"
        />
        <KPICard
          title="Supervisores"
          value={supervisores?.length?.toString?.() ?? '0'}
          subtitle="Liderança"
          icon={Shield}
          color="purple"
        />
        <KPICard
          title="Meta Média/Dia"
          value={Math?.round?.(data?.agentes?.reduce?.((acc, a) => acc + (a?.meta_tickets_dia ?? 0), 0) / (data?.agentes?.length ?? 1)) ?? 0}
          subtitle="Tickets por agente"
          icon={Target}
          color="orange"
        />
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.agentes?.map?.((agente) => (
          <Card key={agente?.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {agente?.nome}
                  </h3>
                  {agente?.supervisor && (
                    <Shield className="w-4 h-4 text-purple-600" />
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {agente?.id}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${agente?.ativo ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>

            <div className="space-y-3">
              {/* Departamento */}
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {agente?.departamento}
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                  {agente?.email}
                </span>
              </div>

              {/* Telefone */}
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {agente?.telefone}
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge className={getExperienceColor(agente?.nivel_experiencia ?? '')}>
                  {agente?.nivel_experiencia}
                </Badge>
                <Badge className={getTurnoColor(agente?.turno ?? '')}>
                  {agente?.turno}
                </Badge>
                {agente?.supervisor && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Supervisor
                  </Badge>
                )}
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">Meta/Dia</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {agente?.meta_tickets_dia}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">Meta Satisfação</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {agente?.meta_satisfacao?.toFixed?.(1) ?? '0.0'}
                  </p>
                </div>
              </div>

              {/* Admissão */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Admissão:</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date(agente?.data_admissao ?? '')?.toLocaleDateString?.('pt-BR') ?? 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-500">Salário Base:</span>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    R$ {agente?.salario_base?.toLocaleString?.('pt-BR') ?? '0'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
