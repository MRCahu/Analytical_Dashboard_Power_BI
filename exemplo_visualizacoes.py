import json
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
from datetime import datetime
import numpy as np

def carregar_dados():
    """Carrega os dados do dashboard"""
    with open('/home/ubuntu/dados_dashboard_atendimento.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def criar_dashboard_executivo(dados):
    """Cria dashboard executivo com KPIs principais"""
    
    # Preparar dados
    resumo = dados['resumo_geral']
    metricas_dept = dados['metricas_departamentos']
    volume_mensal = dados['dados_volume']['volume_mensal']
    
    # Criar subplot com 2x2 gráficos
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('KPIs Principais', 'Performance por Departamento', 
                       'Volume Mensal de Tickets', 'Satisfação por Departamento'),
        specs=[[{"type": "indicator"}, {"type": "bar"}],
               [{"type": "scatter"}, {"type": "bar"}]]
    )
    
    # 1. KPIs Principais (Indicadores)
    fig.add_trace(
        go.Indicator(
            mode="number+gauge+delta",
            value=resumo['taxa_resolucao_geral'],
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': "Taxa de Resolução (%)"},
            gauge={'axis': {'range': [None, 100]},
                   'bar': {'color': "darkblue"},
                   'steps': [{'range': [0, 50], 'color': "lightgray"},
                            {'range': [50, 80], 'color': "gray"}],
                   'threshold': {'line': {'color': "red", 'width': 4},
                               'thickness': 0.75, 'value': 90}}
        ),
        row=1, col=1
    )
    
    # 2. Performance por Departamento
    dept_nomes = [d['departamento'] for d in metricas_dept]
    dept_resolucao = [d['taxa_resolucao_pct'] for d in metricas_dept]
    
    fig.add_trace(
        go.Bar(
            x=dept_nomes,
            y=dept_resolucao,
            name='Taxa Resolução (%)',
            marker_color='lightblue'
        ),
        row=1, col=2
    )
    
    # 3. Volume Mensal
    meses = list(volume_mensal.keys())
    volumes = [volume_mensal[mes]['total_tickets'] for mes in meses]
    
    fig.add_trace(
        go.Scatter(
            x=meses,
            y=volumes,
            mode='lines+markers',
            name='Volume de Tickets',
            line=dict(color='green', width=3),
            marker=dict(size=8)
        ),
        row=2, col=1
    )
    
    # 4. Satisfação por Departamento
    dept_satisfacao = [d['satisfacao_media'] for d in metricas_dept]
    
    fig.add_trace(
        go.Bar(
            x=dept_nomes,
            y=dept_satisfacao,
            name='Satisfação Média',
            marker_color='orange'
        ),
        row=2, col=2
    )
    
    # Layout
    fig.update_layout(
        title_text="Dashboard Executivo - Atendimento ao Cliente",
        title_x=0.5,
        height=800,
        showlegend=False
    )
    
    # Salvar
    fig.write_html('/home/ubuntu/dashboard_executivo.html')
    return fig

def criar_analise_agentes(dados):
    """Cria análise detalhada dos agentes"""
    
    metricas_agentes = dados['metricas_agentes']
    df_agentes = pd.DataFrame(metricas_agentes)
    
    # Criar subplot
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Top 10 Agentes - Volume de Tickets', 
                       'Top 10 Agentes - Satisfação',
                       'Produtividade vs Satisfação', 
                       'Distribuição de Performance'),
        specs=[[{"type": "bar"}, {"type": "bar"}],
               [{"type": "scatter"}, {"type": "histogram"}]]
    )
    
    # 1. Top 10 por volume
    top_volume = df_agentes.nlargest(10, 'total_tickets')
    fig.add_trace(
        go.Bar(
            x=top_volume['agente_nome'],
            y=top_volume['total_tickets'],
            name='Total Tickets',
            marker_color='skyblue'
        ),
        row=1, col=1
    )
    
    # 2. Top 10 por satisfação
    top_satisfacao = df_agentes.nlargest(10, 'satisfacao_media')
    fig.add_trace(
        go.Bar(
            x=top_satisfacao['agente_nome'],
            y=top_satisfacao['satisfacao_media'],
            name='Satisfação Média',
            marker_color='lightgreen'
        ),
        row=1, col=2
    )
    
    # 3. Scatter: Produtividade vs Satisfação
    fig.add_trace(
        go.Scatter(
            x=df_agentes['produtividade_diaria'],
            y=df_agentes['satisfacao_media'],
            mode='markers',
            text=df_agentes['agente_nome'],
            name='Agentes',
            marker=dict(
                size=df_agentes['total_tickets']/50,
                color=df_agentes['taxa_resolucao_pct'],
                colorscale='Viridis',
                showscale=True,
                colorbar=dict(title="Taxa Resolução (%)")
            )
        ),
        row=2, col=1
    )
    
    # 4. Histograma de satisfação
    fig.add_trace(
        go.Histogram(
            x=df_agentes['satisfacao_media'],
            nbinsx=20,
            name='Distribuição Satisfação',
            marker_color='coral'
        ),
        row=2, col=2
    )
    
    # Layout
    fig.update_layout(
        title_text="Análise Detalhada de Performance dos Agentes",
        title_x=0.5,
        height=800,
        showlegend=False
    )
    
    # Rotacionar labels do eixo x
    fig.update_xaxes(tickangle=45, row=1, col=1)
    fig.update_xaxes(tickangle=45, row=1, col=2)
    
    fig.write_html('/home/ubuntu/analise_agentes.html')
    return fig

def criar_analise_temporal(dados):
    """Cria análise temporal dos dados"""
    
    volume_diario = dados['dados_volume']['volume_diario']
    volume_mensal = dados['dados_volume']['volume_mensal']
    
    # Preparar dados diários
    df_diario = pd.DataFrame(list(volume_diario.values()))
    df_diario['data'] = pd.to_datetime(df_diario['data'])
    df_diario['dia_semana_num'] = df_diario['data'].dt.dayofweek
    
    # Preparar dados mensais
    df_mensal = pd.DataFrame(list(volume_mensal.values()))
    
    # Criar subplot
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Volume Diário de Tickets', 
                       'Heatmap - Dia da Semana',
                       'Evolução Mensal', 
                       'Volume por Canal (Último Mês)'),
        specs=[[{"type": "scatter"}, {"type": "bar"}],
               [{"type": "scatter"}, {"type": "pie"}]]
    )
    
    # 1. Volume diário
    fig.add_trace(
        go.Scatter(
            x=df_diario['data'],
            y=df_diario['total_tickets'],
            mode='lines',
            name='Volume Diário',
            line=dict(color='blue', width=2)
        ),
        row=1, col=1
    )
    
    # 2. Volume por dia da semana
    volume_por_dia_semana = df_diario.groupby('dia_semana')['total_tickets'].mean()
    dias_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    
    fig.add_trace(
        go.Bar(
            x=dias_semana,
            y=volume_por_dia_semana.values,
            name='Média por Dia',
            marker_color='lightcoral'
        ),
        row=1, col=2
    )
    
    # 3. Evolução mensal
    fig.add_trace(
        go.Scatter(
            x=df_mensal['mes'],
            y=df_mensal['total_tickets'],
            mode='lines+markers',
            name='Volume Mensal',
            line=dict(color='green', width=3),
            marker=dict(size=10)
        ),
        row=2, col=1
    )
    
    # 4. Volume por canal (último mês disponível)
    ultimo_dia = list(volume_diario.keys())[-1]
    canais_ultimo_dia = volume_diario[ultimo_dia]['tickets_por_canal']
    
    fig.add_trace(
        go.Pie(
            labels=list(canais_ultimo_dia.keys()),
            values=list(canais_ultimo_dia.values()),
            name='Canais'
        ),
        row=2, col=2
    )
    
    # Layout
    fig.update_layout(
        title_text="Análise Temporal do Atendimento",
        title_x=0.5,
        height=800,
        showlegend=False
    )
    
    fig.write_html('/home/ubuntu/analise_temporal.html')
    return fig

def criar_analise_departamental(dados):
    """Cria análise por departamento"""
    
    metricas_dept = dados['metricas_departamentos']
    tickets = dados['tickets']
    
    # Preparar dados
    df_dept = pd.DataFrame(metricas_dept)
    df_tickets = pd.DataFrame(tickets)
    
    # Criar subplot
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Volume vs Taxa de Resolução', 
                       'Tempo Médio de Resolução',
                       'Distribuição de Prioridades', 
                       'Status dos Tickets'),
        specs=[[{"type": "scatter"}, {"type": "bar"}],
               [{"type": "bar"}, {"type": "bar"}]]
    )
    
    # 1. Volume vs Taxa de Resolução
    fig.add_trace(
        go.Scatter(
            x=df_dept['total_tickets'],
            y=df_dept['taxa_resolucao_pct'],
            mode='markers+text',
            text=df_dept['departamento'],
            textposition="top center",
            name='Departamentos',
            marker=dict(
                size=df_dept['satisfacao_media']*10,
                color=df_dept['tempo_medio_resolucao_minutos'],
                colorscale='RdYlBu_r',
                showscale=True,
                colorbar=dict(title="Tempo Resolução (min)")
            )
        ),
        row=1, col=1
    )
    
    # 2. Tempo médio de resolução
    fig.add_trace(
        go.Bar(
            x=df_dept['departamento'],
            y=df_dept['tempo_medio_resolucao_minutos'],
            name='Tempo Resolução (min)',
            marker_color='orange'
        ),
        row=1, col=2
    )
    
    # 3. Distribuição de prioridades (stacked bar)
    prioridades = ['Baixa', 'Normal', 'Alta', 'Crítica']
    cores_prioridade = ['green', 'yellow', 'orange', 'red']
    
    for i, prioridade in enumerate(prioridades):
        valores = [d['tickets_por_prioridade'][prioridade] for d in metricas_dept]
        fig.add_trace(
            go.Bar(
                x=df_dept['departamento'],
                y=valores,
                name=prioridade,
                marker_color=cores_prioridade[i]
            ),
            row=2, col=1
        )
    
    # 4. Status dos tickets (stacked bar)
    status_principais = ['Aberto', 'Em Andamento', 'Resolvido', 'Fechado']
    cores_status = ['red', 'yellow', 'lightgreen', 'green']
    
    for i, status in enumerate(status_principais):
        valores = [d['tickets_por_status'].get(status, 0) for d in metricas_dept]
        fig.add_trace(
            go.Bar(
                x=df_dept['departamento'],
                y=valores,
                name=status,
                marker_color=cores_status[i]
            ),
            row=2, col=2
        )
    
    # Layout
    fig.update_layout(
        title_text="Análise Departamental Detalhada",
        title_x=0.5,
        height=800,
        barmode='stack'
    )
    
    # Rotacionar labels
    fig.update_xaxes(tickangle=45, row=1, col=2)
    fig.update_xaxes(tickangle=45, row=2, col=1)
    fig.update_xaxes(tickangle=45, row=2, col=2)
    
    fig.write_html('/home/ubuntu/analise_departamental.html')
    return fig

def main():
    print("Carregando dados do dashboard...")
    dados = carregar_dados()
    
    print("Criando visualizações...")
    
    print("1. Dashboard Executivo...")
    criar_dashboard_executivo(dados)
    
    print("2. Análise de Agentes...")
    criar_analise_agentes(dados)
    
    print("3. Análise Temporal...")
    criar_analise_temporal(dados)
    
    print("4. Análise Departamental...")
    criar_analise_departamental(dados)
    
    print("\n✅ Visualizações criadas com sucesso!")
    print("📊 Arquivos HTML gerados:")
    print("   • dashboard_executivo.html")
    print("   • analise_agentes.html") 
    print("   • analise_temporal.html")
    print("   • analise_departamental.html")
    
    print(f"\n📈 Resumo dos dados:")
    print(f"   • Total de agentes: {len(dados['agentes'])}")
    print(f"   • Total de tickets: {len(dados['tickets'])}")
    print(f"   • Período: {dados['metadata']['periodo_dados']['inicio'][:10]} a {dados['metadata']['periodo_dados']['fim'][:10]}")
    print(f"   • Taxa de resolução: {dados['resumo_geral']['taxa_resolucao_geral']:.1f}%")
    print(f"   • Satisfação média: {dados['resumo_geral']['satisfacao_geral']:.1f}/5.0")

if __name__ == "__main__":
    main()
