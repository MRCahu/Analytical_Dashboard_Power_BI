
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  Users,
  Ticket,
  TrendingUp,
  Settings,
  Calendar,
  Target,
  Clock,
  MessageSquare
} from 'lucide-react';

const navigation = [
  {
    name: 'Visão Geral',
    href: '/',
    icon: BarChart3,
    description: 'Dashboard principal com métricas gerais'
  },
  {
    name: 'Tickets',
    href: '/tickets',
    icon: Ticket,
    description: 'Gestão e acompanhamento de tickets'
  },
  {
    name: 'Agentes',
    href: '/agentes',
    icon: Users,
    description: 'Performance e gestão dos agentes'
  },
  {
    name: 'Departamentos',
    href: '/departamentos',
    icon: Target,
    description: 'Análise por departamento'
  },
  {
    name: 'Tempo de Resposta',
    href: '/tempo-resposta',
    icon: Clock,
    description: 'Métricas de tempo e SLA'
  },
  {
    name: 'Satisfação',
    href: '/satisfacao',
    icon: MessageSquare,
    description: 'Satisfação do cliente'
  },
  {
    name: 'Relatórios',
    href: '/relatorios',
    icon: TrendingUp,
    description: 'Relatórios e análises'
  }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl border-r border-slate-700/50">
      {/* Header */}
      <div className="px-6 py-8 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              AtendimentoPro
            </h1>
            <p className="text-xs text-slate-400">Dashboard Analytics</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation?.map((item) => {
          const isActive = pathname === item?.href;
          const Icon = item?.icon;
          
          return (
            <Link
              key={item?.href}
              href={item?.href ?? '/'}
              className={cn(
                'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                'hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 hover:shadow-lg hover:scale-[1.02]',
                isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 text-white shadow-lg border border-blue-500/30'
                  : 'text-slate-300 hover:text-white'
              )}
              title={item?.description}
            >
              <Icon className={cn(
                'mr-3 h-5 w-5 transition-colors',
                isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-blue-300'
              )} />
              <span className="flex-1">{item?.name}</span>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>Atualizado: {new Date()?.toLocaleDateString?.('pt-BR') ?? 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}
