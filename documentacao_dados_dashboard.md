# Documentação - Dados Dashboard de Atendimento ao Cliente

## Visão Geral
Este conjunto de dados fictícios foi criado para simular um ambiente realista de atendimento ao cliente, contendo informações detalhadas sobre agentes, tickets, métricas de performance e dados de volume.

## Estrutura dos Dados

### 1. Metadata
```json
{
  "data_geracao": "2024-08-07T...",
  "periodo_dados": {
    "inicio": "2024-02-01T00:00:00",
    "fim": "2024-08-07T00:00:00"
  },
  "total_registros": {
    "agentes": 35,
    "tickets": 14943,
    "departamentos": 5
  }
}
```

### 2. Configuração do Sistema
- **Departamentos**: 5 departamentos com características específicas
- **Tipos de Tickets**: 8 tipos por departamento
- **Status**: 7 status possíveis (Aberto, Em Andamento, etc.)
- **Prioridades**: 4 níveis (Baixa, Normal, Alta, Crítica)
- **Canais**: 6 canais de atendimento

### 3. Agentes (35 registros)
Cada agente contém:
- Informações pessoais (nome, email, telefone)
- Dados profissionais (departamento, nível, data admissão)
- Configurações (turno, metas, salário)
- Status (ativo/inativo, supervisor)

### 4. Tickets (14.943 registros)
Cada ticket inclui:
- Identificação (ID, número, título)
- Classificação (tipo, categoria, prioridade)
- Atendimento (agente, departamento, canal)
- Temporalidade (datas de criação, primeira resposta, resolução)
- Métricas (tempo de resolução, satisfação, SLA)
- Detalhes (descrição, tags, interações)

### 5. Métricas por Agente
Para cada agente:
- Volume de tickets (total, resolvidos, abertos)
- Performance (taxa de resolução, tempo médio)
- Qualidade (satisfação média, SLA)
- Distribuição (por canal, prioridade)
- Produtividade (tickets/dia, meta atingida)

### 6. Métricas por Departamento
Para cada departamento:
- Volumes totais e taxas de resolução
- Tempos médios e satisfação
- Distribuição por prioridade e status
- Volume diário médio

### 7. Dados de Volume Temporal
- **Volume Diário**: Tickets por dia com distribuições
- **Volume Mensal**: Agregações mensais com KPIs

## Características Realistas Implementadas

### Sazonalidade
- Mais tickets em dias úteis (80-120) vs fins de semana (20-40)
- Variação por horário (picos no horário comercial)
- Padrões mensais consistentes

### Comportamento por Departamento
- **Suporte Técnico**: Tickets mais complexos, maior tempo de resolução
- **Comercial**: Volume alto, resolução rápida
- **Financeiro**: Tempo médio, questões específicas
- **Onboarding**: Baixo volume, alta complexidade
- **Relacionamento**: Alto volume, baixa complexidade

### Correlações Realistas
- Prioridade alta → Tempo de resolução menor
- Tickets mais antigos → Maior probabilidade de estar fechado
- Agentes experientes → Melhor performance
- Complexidade do departamento → Tempo de resolução

### Distribuições Probabilísticas
- Status baseado na idade do ticket
- Satisfação correlacionada com tempo de resolução
- Prioridades seguem distribuição natural (mais normais que críticas)

## Exemplos de Uso

### 1. Dashboard Executivo
```javascript
// KPIs principais
const kpis = {
  totalTickets: dados.resumo_geral.total_tickets,
  taxaResolucao: dados.resumo_geral.taxa_resolucao_geral,
  satisfacaoMedia: dados.resumo_geral.satisfacao_geral,
  tempoMedioResolucao: dados.resumo_geral.tempo_medio_resolucao_geral
};
```

### 2. Performance por Agente
```javascript
// Top 5 agentes por satisfação
const topAgentes = dados.metricas_agentes
  .sort((a, b) => b.satisfacao_media - a.satisfacao_media)
  .slice(0, 5);
```

### 3. Análise Temporal
```javascript
// Volume por mês
const volumeMensal = Object.values(dados.dados_volume.volume_mensal)
  .map(mes => ({
    mes: mes.mes,
    tickets: mes.total_tickets,
    satisfacao: mes.satisfacao_media
  }));
```

### 4. Análise por Departamento
```javascript
// Performance departamental
const perfDepartamentos = dados.metricas_departamentos
  .map(dept => ({
    nome: dept.departamento,
    volume: dept.total_tickets,
    eficiencia: dept.taxa_resolucao_pct,
    qualidade: dept.satisfacao_media
  }));
```

## Campos Importantes para Dashboards

### Métricas de Volume
- `total_tickets`: Volume total
- `tickets_resolvidos`: Tickets finalizados
- `volume_diario_medio`: Média diária

### Métricas de Eficiência
- `taxa_resolucao_pct`: % de tickets resolvidos
- `tempo_medio_resolucao_minutos`: Tempo médio em minutos
- `taxa_sla_pct`: % de cumprimento do SLA

### Métricas de Qualidade
- `satisfacao_media`: Nota média (1-5)
- `tickets_reabertos`: Quantidade de reaberturas
- `media_interacoes_por_ticket`: Interações médias

### Segmentações
- Por departamento: `departamento`
- Por agente: `agente_id`, `agente_nome`
- Por canal: `canal`
- Por prioridade: `prioridade`
- Por período: `data_criacao`, `data_resolucao`

## Sugestões de Visualizações

### 1. Gráficos de Linha
- Volume de tickets ao longo do tempo
- Evolução da satisfação mensal
- Tendência de tempo de resolução

### 2. Gráficos de Barras
- Volume por departamento
- Performance por agente
- Distribuição por canal

### 3. Gráficos de Pizza
- Tickets por status
- Distribuição por prioridade
- Participação por departamento

### 4. Heatmaps
- Volume por dia da semana vs hora
- Performance agente vs departamento

### 5. Scorecards/KPIs
- Taxa de resolução geral
- Satisfação média
- SLA médio
- Produtividade por agente

## Filtros Recomendados

### Temporais
- Período (data início/fim)
- Mês específico
- Dia da semana

### Organizacionais
- Departamento
- Agente específico
- Supervisor

### Operacionais
- Status do ticket
- Prioridade
- Canal de atendimento
- Tipo de ticket

### Performance
- Faixa de satisfação
- Tempo de resolução
- SLA cumprido/não cumprido

## Arquivo Gerado
- **Nome**: `dados_dashboard_atendimento.json`
- **Tamanho**: ~15MB
- **Formato**: JSON estruturado
- **Encoding**: UTF-8
- **Período**: 01/02/2024 a 07/08/2024 (187 dias)
