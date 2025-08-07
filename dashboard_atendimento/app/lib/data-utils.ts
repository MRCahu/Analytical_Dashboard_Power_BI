
import { DashboardData, Ticket, Agente, KPIData, FilterState } from './types';

export async function loadDashboardData(): Promise<DashboardData> {
  const response = await fetch('/dados.json');
  if (!response?.ok) {
    throw new Error('Falha ao carregar dados do dashboard');
  }
  return response.json();
}

export function calculateKPIs(tickets: Ticket[], filterState?: FilterState): KPIData {
  const filteredTickets = filterState ? applyFilters(tickets, filterState) : tickets;
  
  const totalTickets = filteredTickets?.length ?? 0;
  const ticketsResolvidos = filteredTickets?.filter(ticket => 
    ticket?.status === 'Resolvido' || ticket?.status === 'Fechado'
  )?.length ?? 0;
  
  const ticketsAbertos = filteredTickets?.filter(ticket => 
    ticket?.status === 'Aberto' || ticket?.status === 'Em Andamento'
  )?.length ?? 0;
  
  const taxaResolucao = totalTickets > 0 ? (ticketsResolvidos / totalTickets) * 100 : 0;
  
  const tempoMedioResposta = calculateAverageResponseTime(filteredTickets);
  const tempoMedioResolucao = calculateAverageResolutionTime(filteredTickets);
  const satisfacaoMedia = calculateAverageSatisfaction(filteredTickets);
  
  const ticketsVencidos = calculateOverdueTickets(filteredTickets);
  
  return {
    totalTickets,
    ticketsResolvidos,
    taxaResolucao,
    tempoMedioResposta,
    tempoMedioResolucao,
    satisfacaoMedia,
    ticketsAbertos,
    ticketsVencidos
  };
}

function calculateAverageResponseTime(tickets: Ticket[]): number {
  const ticketsWithResponseTime = tickets?.filter(ticket => 
    ticket?.tempo_primeira_resposta_minutos != null
  ) ?? [];
  
  if (ticketsWithResponseTime?.length === 0) return 0;
  
  const totalResponseTime = ticketsWithResponseTime?.reduce(
    (sum, ticket) => sum + (ticket?.tempo_primeira_resposta_minutos ?? 0), 0
  ) ?? 0;
  
  return totalResponseTime / ticketsWithResponseTime.length;
}

function calculateAverageResolutionTime(tickets: Ticket[]): number {
  const resolvedTickets = tickets?.filter(ticket => 
    ticket?.tempo_resolucao_minutos != null
  ) ?? [];
  
  if (resolvedTickets?.length === 0) return 0;
  
  const totalResolutionTime = resolvedTickets?.reduce(
    (sum, ticket) => sum + (ticket?.tempo_resolucao_minutos ?? 0), 0
  ) ?? 0;
  
  return totalResolutionTime / resolvedTickets.length;
}

function calculateAverageSatisfaction(tickets: Ticket[]): number {
  const ticketsWithSatisfaction = tickets?.filter(ticket => 
    ticket?.satisfacao_cliente != null
  ) ?? [];
  
  if (ticketsWithSatisfaction?.length === 0) return 0;
  
  const totalSatisfaction = ticketsWithSatisfaction?.reduce(
    (sum, ticket) => sum + (ticket?.satisfacao_cliente ?? 0), 0
  ) ?? 0;
  
  return totalSatisfaction / ticketsWithSatisfaction.length;
}

function calculateOverdueTickets(tickets: Ticket[]): number {
  const now = new Date();
  return tickets?.filter(ticket => {
    if (ticket?.status === 'Resolvido' || ticket?.status === 'Fechado') return false;
    
    const abertura = new Date(ticket?.data_abertura ?? '');
    const horasAbertas = (now.getTime() - abertura.getTime()) / (1000 * 60 * 60);
    
    // Considera vencido se está aberto há mais de 24 horas
    return horasAbertas > 24;
  })?.length ?? 0;
}

function applyFilters(tickets: Ticket[], filterState: FilterState): Ticket[] {
  return tickets?.filter(ticket => {
    const ticketDate = new Date(ticket?.data_abertura ?? '');
    
    const periodoMatch = ticketDate >= filterState?.periodo?.inicio && 
                        ticketDate <= filterState?.periodo?.fim;
    
    const agenteMatch = filterState?.agentes?.length === 0 || 
                       filterState?.agentes?.includes(ticket?.agente_id ?? '');
    
    const departamentoMatch = filterState?.departamentos?.length === 0 || 
                             filterState?.departamentos?.includes(ticket?.categoria ?? '');
    
    const statusMatch = filterState?.status?.length === 0 || 
                       filterState?.status?.includes(ticket?.status ?? '');
    
    const prioridadeMatch = filterState?.prioridades?.length === 0 || 
                           filterState?.prioridades?.includes(ticket?.prioridade ?? '');
    
    const canalMatch = filterState?.canais?.length === 0 || 
                      filterState?.canais?.includes(ticket?.canal ?? '');
    
    return periodoMatch && agenteMatch && departamentoMatch && 
           statusMatch && prioridadeMatch && canalMatch;
  }) ?? [];
}

export function formatTime(minutes: number): string {
  if (!minutes || minutes === 0) return '0min';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) {
    return `${mins}min`;
  }
  
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}min`;
}

export function formatPercentage(value: number): string {
  return `${value?.toFixed?.(1) ?? '0.0'}%`;
}

export function getTicketsByDepartment(tickets: Ticket[]) {
  const departmentCounts = tickets?.reduce((acc, ticket) => {
    const dept = ticket?.categoria ?? 'Outros';
    acc[dept] = (acc[dept] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};
  
  return Object?.entries?.(departmentCounts)?.map(([name, value]) => ({
    name,
    value,
    percentage: ((value / (tickets?.length ?? 1)) * 100)?.toFixed?.(1) ?? '0.0'
  })) ?? [];
}

export function getTicketsByStatus(tickets: Ticket[]) {
  const statusCounts = tickets?.reduce((acc, ticket) => {
    const status = ticket?.status ?? 'Desconhecido';
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};
  
  return Object?.entries?.(statusCounts)?.map(([name, value]) => ({
    name,
    value,
    percentage: ((value / (tickets?.length ?? 1)) * 100)?.toFixed?.(1) ?? '0.0'
  })) ?? [];
}

export function getTicketTrend(tickets: Ticket[], days: number = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const filteredTickets = tickets?.filter(ticket => {
    const ticketDate = new Date(ticket?.data_abertura ?? '');
    return ticketDate >= startDate && ticketDate <= endDate;
  }) ?? [];
  
  const dailyCounts: Record<string, number> = {};
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    dailyCounts[dateKey] = 0;
  }
  
  filteredTickets?.forEach(ticket => {
    const dateKey = ticket?.data_abertura?.split?.('T')?.[0];
    if (dateKey && dailyCounts.hasOwnProperty(dateKey)) {
      dailyCounts[dateKey]++;
    }
  });
  
  return Object?.entries?.(dailyCounts)?.map(([date, tickets]) => ({
    date,
    tickets,
    dateFormatted: new Date(date)?.toLocaleDateString?.('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    }) ?? date
  })) ?? [];
}
