
export interface Metadata {
  data_geracao: string;
  periodo_dados: {
    inicio: string;
    fim: string;
  };
  total_registros: {
    agentes: number;
    tickets: number;
    departamentos: number;
  };
  versao: string;
}

export interface Departamento {
  codigo: string;
  descricao: string;
  nivel_complexidade: string;
  tempo_medio_resolucao: number;
}

export interface Agente {
  id: string;
  nome: string;
  email: string;
  departamento: string;
  codigo_departamento: string;
  nivel_experiencia: string;
  data_admissao: string;
  ativo: boolean;
  turno: string;
  meta_tickets_dia: number;
  meta_satisfacao: number;
  salario_base: number;
  telefone: string;
  supervisor: boolean;
}

export interface Ticket {
  id: string;
  numero_ticket: number;
  titulo: string;
  descricao: string;
  tipo: string;
  categoria: string;
  subcategoria: string;
  prioridade: string;
  status: string;
  canal: string;
  cliente_id: string;
  agente_id: string;
  agente_nome: string;
  data_abertura: string;
  data_primeira_resposta?: string;
  data_resolucao?: string;
  data_fechamento?: string;
  tempo_primeira_resposta_minutos?: number;
  tempo_resolucao_minutos?: number;
  tempo_total_minutos?: number;
  satisfacao_cliente?: number;
  comentario_satisfacao?: string;
  valor_comercial?: number;
  tags: string[];
  escalado: boolean;
  reaberto: boolean;
  numero_interacoes: number;
}

export interface PerformanceMetrics {
  agente_id: string;
  periodo: string;
  tickets_atendidos: number;
  tempo_medio_resposta: number;
  tempo_medio_resolucao: number;
  taxa_resolucao: number;
  satisfacao_media: number;
  tickets_por_dia: number;
  produtividade_score: number;
}

export interface DashboardData {
  metadata: Metadata;
  configuracao: {
    departamentos: Record<string, Departamento>;
    tipos_tickets: Record<string, string[]>;
    status_possiveis: string[];
    prioridades: string[];
    canais_atendimento: string[];
  };
  agentes: Agente[];
  tickets: Ticket[];
  performance_agentes: PerformanceMetrics[];
}

export interface FilterState {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  agentes: string[];
  departamentos: string[];
  status: string[];
  prioridades: string[];
  canais: string[];
}

export interface KPIData {
  totalTickets: number;
  ticketsResolvidos: number;
  taxaResolucao: number;
  tempoMedioResposta: number;
  tempoMedioResolucao: number;
  satisfacaoMedia: number;
  ticketsAbertos: number;
  ticketsVencidos: number;
}
