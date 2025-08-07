import json
import random
from datetime import datetime, timedelta
from faker import Faker
import uuid

# Configurar faker para português brasileiro
fake = Faker('pt_BR')
random.seed(42)  # Para reprodutibilidade

# Configurações gerais
START_DATE = datetime(2024, 2, 1)
END_DATE = datetime(2024, 8, 7)
TOTAL_DAYS = (END_DATE - START_DATE).days

# Departamentos e suas características
DEPARTAMENTOS = {
    "Suporte Técnico": {
        "codigo": "SUP",
        "descricao": "Resolução de problemas técnicos e bugs",
        "nivel_complexidade": "alto",
        "tempo_medio_resolucao": 180  # minutos
    },
    "Atendimento Comercial": {
        "codigo": "COM",
        "descricao": "Vendas, renovações e questões comerciais",
        "nivel_complexidade": "medio",
        "tempo_medio_resolucao": 45
    },
    "Financeiro": {
        "codigo": "FIN",
        "descricao": "Cobranças, pagamentos e questões financeiras",
        "nivel_complexidade": "medio",
        "tempo_medio_resolucao": 60
    },
    "Onboarding": {
        "codigo": "ONB",
        "descricao": "Implementação e treinamento de novos clientes",
        "nivel_complexidade": "alto",
        "tempo_medio_resolucao": 240
    },
    "Relacionamento": {
        "codigo": "REL",
        "descricao": "Gestão de contas e relacionamento com clientes",
        "nivel_complexidade": "baixo",
        "tempo_medio_resolucao": 30
    }
}

# Tipos de tickets por departamento
TIPOS_TICKETS = {
    "Suporte Técnico": [
        "Bug no Sistema", "Erro de Integração", "Problema de Performance", 
        "Falha de Login", "Erro de Sincronização", "Problema de Conectividade",
        "Falha na API", "Erro de Configuração"
    ],
    "Atendimento Comercial": [
        "Solicitação de Proposta", "Renovação de Contrato", "Upgrade de Plano",
        "Cancelamento", "Negociação de Preços", "Informações sobre Produtos",
        "Demonstração", "Consulta Comercial"
    ],
    "Financeiro": [
        "Cobrança Indevida", "Problema no Pagamento", "Solicitação de Nota Fiscal",
        "Reembolso", "Alteração de Dados de Cobrança", "Consulta de Faturamento",
        "Parcelamento", "Segunda Via de Boleto"
    ],
    "Onboarding": [
        "Configuração Inicial", "Treinamento de Usuários", "Migração de Dados",
        "Integração com Sistemas", "Personalização", "Validação de Setup",
        "Documentação", "Go-Live"
    ],
    "Relacionamento": [
        "Check-in Periódico", "Feedback do Cliente", "Solicitação de Melhoria",
        "Renovação Antecipada", "Upsell", "Cross-sell", "Satisfação",
        "Relacionamento Estratégico"
    ]
}

# Status possíveis dos tickets
STATUS_TICKETS = [
    "Aberto", "Em Andamento", "Aguardando Cliente", "Aguardando Terceiros",
    "Resolvido", "Fechado", "Cancelado"
]

# Prioridades
PRIORIDADES = ["Baixa", "Normal", "Alta", "Crítica"]

# Canais de atendimento
CANAIS = ["Email", "Chat", "Telefone", "WhatsApp", "Portal", "Presencial"]

def gerar_agentes():
    """Gera dados dos agentes de atendimento"""
    agentes = []
    
    # Distribuição de agentes por departamento
    distribuicao = {
        "Suporte Técnico": 8,
        "Atendimento Comercial": 12,
        "Financeiro": 6,
        "Onboarding": 5,
        "Relacionamento": 4
    }
    
    agent_id = 1
    for dept, quantidade in distribuicao.items():
        for i in range(quantidade):
            agente = {
                "id": f"AGT{agent_id:03d}",
                "nome": fake.name(),
                "email": fake.email(),
                "departamento": dept,
                "codigo_departamento": DEPARTAMENTOS[dept]["codigo"],
                "nivel_experiencia": random.choices(
                    ["Junior", "Pleno", "Senior", "Especialista"],
                    weights=[30, 40, 25, 5]
                )[0],
                "data_admissao": fake.date_between(start_date='-3y', end_date='-6m'),
                "ativo": random.choices([True, False], weights=[95, 5])[0],
                "turno": random.choice(["Manhã", "Tarde", "Noite"]),
                "meta_tickets_dia": random.randint(15, 35),
                "meta_satisfacao": random.uniform(4.2, 4.8),
                "salario_base": random.randint(3000, 8000),
                "telefone": fake.phone_number(),
                "supervisor": random.choice([True, False]) if i < 2 else False
            }
            agentes.append(agente)
            agent_id += 1
    
    return agentes

def gerar_tickets(agentes):
    """Gera histórico de tickets"""
    tickets = []
    ticket_id = 1
    
    # Gerar tickets para cada dia do período
    current_date = START_DATE
    while current_date <= END_DATE:
        # Variação sazonal (mais tickets em dias úteis)
        if current_date.weekday() < 5:  # Segunda a sexta
            base_tickets = random.randint(80, 120)
        else:  # Fim de semana
            base_tickets = random.randint(20, 40)
        
        # Variação por hora do dia
        for _ in range(base_tickets):
            # Escolher agente aleatório (ativo)
            agente = random.choice([a for a in agentes if a["ativo"]])
            departamento = agente["departamento"]
            
            # Hora de criação (horário comercial tem mais tickets)
            if current_date.weekday() < 5:
                hora_criacao = random.choices(
                    range(24),
                    weights=[1,1,1,1,1,1,2,3,8,12,15,18,20,18,15,12,8,5,3,2,1,1,1,1]
                )[0]
            else:
                hora_criacao = random.randint(0, 23)
            
            data_criacao = current_date.replace(
                hour=hora_criacao,
                minute=random.randint(0, 59),
                second=random.randint(0, 59)
            )
            
            # Tipo de ticket baseado no departamento
            tipo_ticket = random.choice(TIPOS_TICKETS[departamento])
            
            # Prioridade baseada no tipo e departamento
            if "Crítica" in tipo_ticket or "Bug" in tipo_ticket:
                prioridade = random.choices(PRIORIDADES, weights=[10, 30, 40, 20])[0]
            else:
                prioridade = random.choices(PRIORIDADES, weights=[30, 50, 15, 5])[0]
            
            # Status baseado na data (tickets mais antigos têm maior chance de estar fechados)
            dias_desde_criacao = (END_DATE - data_criacao).days
            if dias_desde_criacao > 30:
                status = random.choices(STATUS_TICKETS, weights=[5, 10, 5, 5, 35, 35, 5])[0]
            elif dias_desde_criacao > 7:
                status = random.choices(STATUS_TICKETS, weights=[10, 20, 15, 10, 25, 15, 5])[0]
            else:
                status = random.choices(STATUS_TICKETS, weights=[25, 30, 20, 15, 5, 3, 2])[0]
            
            # Tempo de resolução baseado no departamento e prioridade
            tempo_base = DEPARTAMENTOS[departamento]["tempo_medio_resolucao"]
            if prioridade == "Crítica":
                tempo_resolucao = random.randint(int(tempo_base * 0.3), int(tempo_base * 0.7))
            elif prioridade == "Alta":
                tempo_resolucao = random.randint(int(tempo_base * 0.6), int(tempo_base * 1.2))
            elif prioridade == "Normal":
                tempo_resolucao = random.randint(int(tempo_base * 0.8), int(tempo_base * 1.5))
            else:  # Baixa
                tempo_resolucao = random.randint(int(tempo_base * 1.2), int(tempo_base * 2.0))
            
            # Data de resolução (se aplicável)
            data_resolucao = None
            if status in ["Resolvido", "Fechado"]:
                data_resolucao = data_criacao + timedelta(minutes=tempo_resolucao)
                if data_resolucao > END_DATE:
                    data_resolucao = END_DATE
            
            # Satisfação do cliente (apenas para tickets resolvidos/fechados)
            satisfacao = None
            if status in ["Resolvido", "Fechado"]:
                # Satisfação baseada no tempo de resolução e agente
                base_satisfacao = 4.0
                if tempo_resolucao < tempo_base * 0.8:
                    base_satisfacao = 4.5
                elif tempo_resolucao > tempo_base * 1.5:
                    base_satisfacao = 3.5
                
                satisfacao = round(random.uniform(base_satisfacao - 0.5, base_satisfacao + 0.5), 1)
                satisfacao = max(1.0, min(5.0, satisfacao))
            
            ticket = {
                "id": f"TKT{ticket_id:06d}",
                "numero_ticket": ticket_id,
                "titulo": f"{tipo_ticket} - {fake.catch_phrase()}",
                "descricao": fake.text(max_nb_chars=200),
                "tipo": tipo_ticket,
                "categoria": departamento,
                "subcategoria": random.choice(["Dúvida", "Problema", "Solicitação", "Reclamação"]),
                "prioridade": prioridade,
                "status": status,
                "canal": random.choices(CANAIS, weights=[30, 25, 20, 15, 8, 2])[0],
                "cliente_id": f"CLI{random.randint(1, 500):04d}",
                "cliente_nome": fake.company(),
                "agente_id": agente["id"],
                "agente_nome": agente["nome"],
                "departamento": departamento,
                "data_criacao": data_criacao.isoformat(),
                "data_primeira_resposta": (data_criacao + timedelta(minutes=random.randint(5, 120))).isoformat() if status != "Aberto" else None,
                "data_resolucao": data_resolucao.isoformat() if data_resolucao else None,
                "tempo_resolucao_minutos": tempo_resolucao if data_resolucao else None,
                "tempo_primeira_resposta_minutos": random.randint(5, 120) if status != "Aberto" else None,
                "satisfacao_cliente": satisfacao,
                "tags": random.sample(["urgente", "vip", "recorrente", "escalado", "complexo", "simples"], k=random.randint(0, 3)),
                "interacoes": random.randint(1, 8),
                "reaberto": random.choice([True, False]) if status in ["Resolvido", "Fechado"] else False,
                "sla_cumprido": random.choices([True, False], weights=[85, 15])[0] if data_resolucao else None
            }
            
            tickets.append(ticket)
            ticket_id += 1
        
        current_date += timedelta(days=1)
    
    return tickets

def calcular_metricas_agentes(agentes, tickets):
    """Calcula métricas de performance por agente"""
    metricas = []
    
    for agente in agentes:
        tickets_agente = [t for t in tickets if t["agente_id"] == agente["id"]]
        tickets_resolvidos = [t for t in tickets_agente if t["status"] in ["Resolvido", "Fechado"]]
        tickets_com_satisfacao = [t for t in tickets_resolvidos if t["satisfacao_cliente"]]
        
        # Métricas básicas
        total_tickets = len(tickets_agente)
        tickets_resolvidos_count = len(tickets_resolvidos)
        taxa_resolucao = (tickets_resolvidos_count / total_tickets * 100) if total_tickets > 0 else 0
        
        # Tempo médio de resolução
        tempos_resolucao = [t["tempo_resolucao_minutos"] for t in tickets_resolvidos if t["tempo_resolucao_minutos"]]
        tempo_medio_resolucao = sum(tempos_resolucao) / len(tempos_resolucao) if tempos_resolucao else 0
        
        # Satisfação média
        satisfacoes = [t["satisfacao_cliente"] for t in tickets_com_satisfacao]
        satisfacao_media = sum(satisfacoes) / len(satisfacoes) if satisfacoes else 0
        
        # SLA
        tickets_com_sla = [t for t in tickets_resolvidos if t["sla_cumprido"] is not None]
        sla_cumprido = sum(1 for t in tickets_com_sla if t["sla_cumprido"])
        taxa_sla = (sla_cumprido / len(tickets_com_sla) * 100) if tickets_com_sla else 0
        
        # Tickets por canal
        canais_count = {}
        for canal in CANAIS:
            canais_count[canal] = len([t for t in tickets_agente if t["canal"] == canal])
        
        # Tickets por prioridade
        prioridades_count = {}
        for prioridade in PRIORIDADES:
            prioridades_count[prioridade] = len([t for t in tickets_agente if t["prioridade"] == prioridade])
        
        metrica = {
            "agente_id": agente["id"],
            "agente_nome": agente["nome"],
            "departamento": agente["departamento"],
            "periodo": f"{START_DATE.strftime('%Y-%m-%d')} a {END_DATE.strftime('%Y-%m-%d')}",
            "total_tickets": total_tickets,
            "tickets_resolvidos": tickets_resolvidos_count,
            "tickets_abertos": len([t for t in tickets_agente if t["status"] == "Aberto"]),
            "tickets_em_andamento": len([t for t in tickets_agente if t["status"] == "Em Andamento"]),
            "taxa_resolucao_pct": round(taxa_resolucao, 2),
            "tempo_medio_resolucao_minutos": round(tempo_medio_resolucao, 2),
            "tempo_medio_primeira_resposta_minutos": round(sum([t["tempo_primeira_resposta_minutos"] for t in tickets_agente if t["tempo_primeira_resposta_minutos"]]) / len([t for t in tickets_agente if t["tempo_primeira_resposta_minutos"]]), 2) if any(t["tempo_primeira_resposta_minutos"] for t in tickets_agente) else 0,
            "satisfacao_media": round(satisfacao_media, 2),
            "taxa_sla_pct": round(taxa_sla, 2),
            "tickets_reabertos": len([t for t in tickets_agente if t["reaberto"]]),
            "media_interacoes_por_ticket": round(sum([t["interacoes"] for t in tickets_agente]) / len(tickets_agente), 2) if tickets_agente else 0,
            "tickets_por_canal": canais_count,
            "tickets_por_prioridade": prioridades_count,
            "produtividade_diaria": round(total_tickets / TOTAL_DAYS, 2),
            "meta_atingida": total_tickets >= (agente["meta_tickets_dia"] * TOTAL_DAYS * 0.8)
        }
        
        metricas.append(metrica)
    
    return metricas

def calcular_metricas_departamento(tickets):
    """Calcula métricas por departamento"""
    metricas_dept = []
    
    for dept_nome in DEPARTAMENTOS.keys():
        tickets_dept = [t for t in tickets if t["departamento"] == dept_nome]
        tickets_resolvidos = [t for t in tickets_dept if t["status"] in ["Resolvido", "Fechado"]]
        
        total_tickets = len(tickets_dept)
        if total_tickets == 0:
            continue
            
        metrica = {
            "departamento": dept_nome,
            "codigo": DEPARTAMENTOS[dept_nome]["codigo"],
            "total_tickets": total_tickets,
            "tickets_resolvidos": len(tickets_resolvidos),
            "taxa_resolucao_pct": round(len(tickets_resolvidos) / total_tickets * 100, 2),
            "tempo_medio_resolucao_minutos": round(sum([t["tempo_resolucao_minutos"] for t in tickets_resolvidos if t["tempo_resolucao_minutos"]]) / len([t for t in tickets_resolvidos if t["tempo_resolucao_minutos"]]), 2) if any(t["tempo_resolucao_minutos"] for t in tickets_resolvidos) else 0,
            "satisfacao_media": round(sum([t["satisfacao_cliente"] for t in tickets_resolvidos if t["satisfacao_cliente"]]) / len([t for t in tickets_resolvidos if t["satisfacao_cliente"]]), 2) if any(t["satisfacao_cliente"] for t in tickets_resolvidos) else 0,
            "tickets_por_prioridade": {p: len([t for t in tickets_dept if t["prioridade"] == p]) for p in PRIORIDADES},
            "tickets_por_status": {s: len([t for t in tickets_dept if t["status"] == s]) for s in STATUS_TICKETS},
            "volume_diario_medio": round(total_tickets / TOTAL_DAYS, 2)
        }
        
        metricas_dept.append(metrica)
    
    return metricas_dept

def gerar_dados_volume_temporal(tickets):
    """Gera dados de volume por período"""
    volume_diario = {}
    volume_semanal = {}
    volume_mensal = {}
    
    # Volume diário
    current_date = START_DATE
    while current_date <= END_DATE:
        date_str = current_date.strftime('%Y-%m-%d')
        tickets_dia = [t for t in tickets if t["data_criacao"].startswith(date_str)]
        
        volume_diario[date_str] = {
            "data": date_str,
            "dia_semana": current_date.strftime('%A'),
            "total_tickets": len(tickets_dia),
            "tickets_por_departamento": {dept: len([t for t in tickets_dia if t["departamento"] == dept]) for dept in DEPARTAMENTOS.keys()},
            "tickets_por_canal": {canal: len([t for t in tickets_dia if t["canal"] == canal]) for canal in CANAIS},
            "tickets_por_prioridade": {p: len([t for t in tickets_dia if t["prioridade"] == p]) for p in PRIORIDADES}
        }
        
        current_date += timedelta(days=1)
    
    # Volume mensal
    for mes in range(2, 9):  # Fevereiro a Agosto
        if mes > 8:
            break
        mes_str = f"2024-{mes:02d}"
        tickets_mes = [t for t in tickets if t["data_criacao"].startswith(mes_str)]
        
        volume_mensal[mes_str] = {
            "mes": mes_str,
            "total_tickets": len(tickets_mes),
            "tickets_resolvidos": len([t for t in tickets_mes if t["status"] in ["Resolvido", "Fechado"]]),
            "satisfacao_media": round(sum([t["satisfacao_cliente"] for t in tickets_mes if t["satisfacao_cliente"]]) / len([t for t in tickets_mes if t["satisfacao_cliente"]]), 2) if any(t["satisfacao_cliente"] for t in tickets_mes) else 0,
            "tempo_medio_resolucao": round(sum([t["tempo_resolucao_minutos"] for t in tickets_mes if t["tempo_resolucao_minutos"]]) / len([t for t in tickets_mes if t["tempo_resolucao_minutos"]]), 2) if any(t["tempo_resolucao_minutos"] for t in tickets_mes) else 0
        }
    
    return {
        "volume_diario": volume_diario,
        "volume_mensal": volume_mensal
    }

def main():
    print("Gerando dados fictícios para dashboard de atendimento...")
    
    # Gerar dados
    print("1. Gerando agentes...")
    agentes = gerar_agentes()
    
    print("2. Gerando tickets...")
    tickets = gerar_tickets(agentes)
    
    print("3. Calculando métricas por agente...")
    metricas_agentes = calcular_metricas_agentes(agentes, tickets)
    
    print("4. Calculando métricas por departamento...")
    metricas_departamentos = calcular_metricas_departamento(tickets)
    
    print("5. Gerando dados de volume temporal...")
    dados_volume = gerar_dados_volume_temporal(tickets)
    
    # Estrutura final dos dados
    dados_dashboard = {
        "metadata": {
            "data_geracao": datetime.now().isoformat(),
            "periodo_dados": {
                "inicio": START_DATE.isoformat(),
                "fim": END_DATE.isoformat()
            },
            "total_registros": {
                "agentes": len(agentes),
                "tickets": len(tickets),
                "departamentos": len(DEPARTAMENTOS)
            },
            "versao": "1.0"
        },
        "configuracao": {
            "departamentos": DEPARTAMENTOS,
            "tipos_tickets": TIPOS_TICKETS,
            "status_possiveis": STATUS_TICKETS,
            "prioridades": PRIORIDADES,
            "canais_atendimento": CANAIS
        },
        "agentes": agentes,
        "tickets": tickets,
        "metricas_agentes": metricas_agentes,
        "metricas_departamentos": metricas_departamentos,
        "dados_volume": dados_volume,
        "resumo_geral": {
            "total_tickets": len(tickets),
            "tickets_resolvidos": len([t for t in tickets if t["status"] in ["Resolvido", "Fechado"]]),
            "taxa_resolucao_geral": round(len([t for t in tickets if t["status"] in ["Resolvido", "Fechado"]]) / len(tickets) * 100, 2),
            "satisfacao_geral": round(sum([t["satisfacao_cliente"] for t in tickets if t["satisfacao_cliente"]]) / len([t for t in tickets if t["satisfacao_cliente"]]), 2) if any(t["satisfacao_cliente"] for t in tickets) else 0,
            "tempo_medio_resolucao_geral": round(sum([t["tempo_resolucao_minutos"] for t in tickets if t["tempo_resolucao_minutos"]]) / len([t for t in tickets if t["tempo_resolucao_minutos"]]), 2) if any(t["tempo_resolucao_minutos"] for t in tickets) else 0,
            "agentes_ativos": len([a for a in agentes if a["ativo"]]),
            "departamentos_ativos": len(DEPARTAMENTOS)
        }
    }
    
    # Salvar dados
    print("6. Salvando dados em JSON...")
    with open('/home/ubuntu/dados_dashboard_atendimento.json', 'w', encoding='utf-8') as f:
        json.dump(dados_dashboard, f, ensure_ascii=False, indent=2, default=str)
    
    print(f"\n✅ Dados gerados com sucesso!")
    print(f"📊 Total de agentes: {len(agentes)}")
    print(f"🎫 Total de tickets: {len(tickets)}")
    print(f"📅 Período: {START_DATE.strftime('%d/%m/%Y')} a {END_DATE.strftime('%d/%m/%Y')}")
    print(f"💾 Arquivo salvo: dados_dashboard_atendimento.json")
    
    # Estatísticas rápidas
    print(f"\n📈 Estatísticas rápidas:")
    print(f"   • Taxa de resolução geral: {dados_dashboard['resumo_geral']['taxa_resolucao_geral']:.1f}%")
    print(f"   • Satisfação média: {dados_dashboard['resumo_geral']['satisfacao_geral']:.1f}/5.0")
    print(f"   • Tempo médio de resolução: {dados_dashboard['resumo_geral']['tempo_medio_resolucao_geral']:.0f} minutos")
    print(f"   • Volume médio diário: {len(tickets)/TOTAL_DAYS:.0f} tickets/dia")

if __name__ == "__main__":
    main()
