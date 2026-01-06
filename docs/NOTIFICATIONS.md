# Notificações — desenho para fases futuras (UTMB CRM)

Este documento descreve um caminho incremental para adicionar notificações no CRM sem aumentar muito a complexidade do MVP.

## Objetivo
- Ajudar a não perder **tarefas** e **mudanças importantes** no pipeline.
- Começar simples (in-app) e evoluir para persistência e email (Microsoft) quando fizer sentido.

---

## Fase 1 — In-app (sem tabela nova)
**O que é:** notificações calculadas em tempo real a partir do banco, sem persistir nada novo.

### Gatilhos (sugestão)
- Tarefas vencidas (activities: `type='task' AND completed=false AND activity_date < now()`).
- Tarefas do dia (mesma regra, filtrando para hoje).

### UX
- Badge no header (ex.: “3”).
- Lista simples ao clicar (ou mini-painel no `/tasks`).
- Toast opcional apenas quando abrir o app (não spam).

### Prós / Contras
- Pró: zero migrações, rápido, baixo risco.
- Contra: não registra histórico “você foi notificado em X”.

---

## Fase 2 — Persistente (tabela `notifications`)
**O que é:** salvar eventos de notificação para auditoria e melhor UX.

### Estrutura sugerida
- `id` (uuid)
- `user_id` (uuid)
- `type` (text) — `task_overdue`, `task_due_today`, `deal_stage_changed`, etc.
- `entity_type` (text) — `deal`, `task`, `contact`
- `entity_id` (uuid/text)
- `title` (text)
- `body` (text)
- `read_at` (timestamptz nullable)
- `created_at` (timestamptz)

### Gatilhos (sugestão)
- Mudança de estágio do deal.
- Criação de novo deal.
- Upload de documento no deal.

### Como gerar
- No backend (API routes/server actions) ao executar a operação, criar notificação.
- Para tarefas vencidas, usar um job (cron) diário/horário que gera notificações apenas quando muda o estado.

---

## Fase 3 — Email (Microsoft Graph)
**O que é:** envio de notificações por email para o Outlook.

### Pré-requisitos técnicos
- Refresh token implementado (tokens expiram).
- Estratégia anti-spam:
  - resumo diário/semanal, ou
  - limites por tipo (ex.: no máx. 1 por deal por dia).
- Logs/observabilidade (para depurar falhas no Graph).

### Estratégia recomendada
- Primeiro enviar **resumos** (digest), não eventos individuais.
- Permitir opt-in/opt-out por tipo.

---

## Observações
- Hoje o CRM já tem `activities` (tarefas) e `deals` (pipeline): a Fase 1 já traz valor grande com esforço baixo.
- Se/quando for retomar, o caminho mais seguro é: **Fase 1 → Fase 2 → Fase 3**.

