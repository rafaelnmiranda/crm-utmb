# Schema do Banco de Dados - UTMB CRM

## Diagrama de Relacionamentos

```
┌─────────────────┐
│     events      │
│─────────────────│
│ id (PK)         │◄─────┐
│ name            │      │
│ year            │      │
│ start_date      │      │
│ end_date        │      │
│ created_at      │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│    sectors      │      │
│─────────────────│      │
│ id (PK)         │      │
│ name            │      │
│ category        │      │
│ description     │      │
│ created_at      │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│ organizations   │      │
│─────────────────│      │
│ id (PK)         │◄─────┼─────┐
│ name            │      │     │
│ partner_subcat  │      │     │
│ website         │      │     │
│ sector_ids[]    │      │     │
│ created_at      │      │     │
│ updated_at      │      │     │
└─────────────────┘      │     │
         │               │     │
         │               │     │
         │               │     │
         ▼               │     │
┌─────────────────┐      │     │
│    contacts     │      │     │
│─────────────────│      │     │
│ id (PK)         │      │     │
│ organization_id │──────┘     │
│ name            │            │
│ email           │            │
│ phone           │            │
│ position        │            │
│ created_at      │            │
│ updated_at      │            │
└─────────────────┘            │
                               │
┌─────────────────┐            │
│sponsorship_tiers│            │
│─────────────────│            │
│ id (PK)         │◄─────┐     │
│ name            │      │     │
│ value_brl       │      │     │
│ description     │      │     │
│ created_at      │      │     │
└─────────────────┘      │     │
         │               │     │
         │               │     │
         ▼               │     │
┌─────────────────┐      │     │
│sponsorship_     │      │     │
│counterparts     │      │     │
│─────────────────│      │     │
│ id (PK)         │      │     │
│ tier_id         │──────┘     │
│ name            │            │
│ included        │            │
│ details         │            │
│ created_at      │            │
└─────────────────┘            │
                               │
┌─────────────────┐            │
│pipeline_stages  │            │
│─────────────────│            │
│ id (PK)         │◄─────┐     │
│ name            │      │     │
│ position        │      │     │
│ color           │      │     │
│ is_lost         │      │     │
│ created_at      │      │     │
└─────────────────┘      │     │
                         │     │
                         │     │
┌─────────────────┐      │     │
│      deals      │      │     │
│─────────────────│      │     │
│ id (PK)         │──────┼─────┼───┐
│ title           │      │     │   │
│ organization_id │──────┘     │   │
│ event_id        │────────────┘   │
│ stage_id        │────────────────┘
│ sponsorship_    │                │
│   tier_id       │────────────────┘
│ type            │                │
│ value_monetary  │                │
│ value_barter    │                │
│ currency        │                │
│ barter_desc     │                │
│ stand_location  │                │
│ expected_close  │                │
│ created_at      │                │
│ updated_at      │                │
└─────────────────┘                │
         │                          │
         │                          │
    ┌────┴────┬──────────┬──────────┼──────────┬──────────┐
    │         │          │          │          │          │
    ▼         ▼          ▼          ▼          ▼          ▼
┌─────────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────┐ ┌────────┐
│deal_    │ │deal_ │ │deal_   │ │deal_ │ │acti- │ │deal_   │
│stands   │ │tags  │ │counter-│ │docu- │ │vities│ │docu-   │
│         │ │      │ │parts   │ │ments │ │      │ │ments   │
│─────────│ │──────│ │────────│ │──────│ │──────│ │────────│
│id (PK)  │ │id(PK)│ │id (PK) │ │id(PK)│ │id(PK)│ │id (PK) │
│deal_id  │ │deal_ │ │deal_id │ │deal_ │ │deal_ │ │deal_id │
│stand_   │ │id    │ │counter │ │id    │ │type  │ │file_   │
│code     │ │tag_id│ │part_id │ │file_ │ │title │ │name    │
│created  │ │      │ │name    │ │name  │ │desc  │ │file_   │
│         │ │      │ │included│ │path  │ │date  │ │path    │
│         │ │      │ │custom  │ │size  │ │next_ │ │size    │
│         │ │      │ │        │ │mime  │ │action│ │mime    │
│         │ │      │ │        │ │      │ │compl │ │upload  │
│         │ │      │ │        │ │      │ │      │ │        │
└─────────┘ └──────┘ └────────┘ └──────┘ └──────┘ └────────┘

┌─────────────────┐
│  calendar_events│
│─────────────────│
│ id (PK)         │
│ deal_id         │──────┐
│ microsoft_      │      │
│   event_id      │      │
│ title           │      │
│ start_time      │      │
│ end_time        │      │
│ synced_at       │      │
└─────────────────┘      │
                         │
┌─────────────────┐      │
│   ai_messages   │      │
│─────────────────│      │
│ id (PK)         │      │
│ deal_id         │──────┘
│ template_type   │
│ prompt          │
│ generated_text  │
│ edited_text     │
│ sent            │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     tags        │
│─────────────────│
│ id (PK)         │
│ name            │
│ color           │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│ microsoft_tokens│
│─────────────────│
│ id (PK)         │
│ user_id         │──────► auth.users
│ access_token    │
│ refresh_token   │
│ expires_at      │
│ created_at      │
│ updated_at      │
└─────────────────┘
```

---

## Tabelas Detalhadas

### 1. `events` - Eventos
Armazena informações sobre os eventos UTMB.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL, UNIQUE | Nome do evento |
| `year` | INTEGER | NOT NULL | Ano do evento |
| `start_date` | DATE | | Data de início |
| `end_date` | DATE | | Data de término |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

---

### 2. `sectors` - Setores (Classificação UTMB)
Categorias de setores para classificação de organizações.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL, UNIQUE | Nome do setor |
| `category` | TEXT | NOT NULL, CHECK | Categoria UTMB:<br>- `event_requirement`<br>- `protected_transitional`<br>- `restricted_1`<br>- `restricted_2`<br>- `prohibited`<br>- `open` |
| `description` | TEXT | | Descrição do setor |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

---

### 3. `organizations` - Organizações (Clientes)
Armazena informações das organizações/clientes.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL | Nome da organização |
| `partner_subcategory` | TEXT | CHECK | Subcategoria de parceiro:<br>- `pousada`<br>- `restaurante`<br>- `outro` |
| `website` | TEXT | | Website da organização |
| `sector_ids` | UUID[] | DEFAULT '{}' | Array de IDs de setores |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

**RLS:** Habilitado - Usuários autenticados podem gerenciar

---

### 4. `contacts` - Contatos (Pessoas)
Armazena informações de contatos das organizações.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `organization_id` | UUID | REFERENCES organizations(id) ON DELETE CASCADE | Organização relacionada |
| `name` | TEXT | NOT NULL | Nome do contato |
| `email` | TEXT | | Email do contato |
| `phone` | TEXT | | Telefone do contato |
| `position` | TEXT | | Cargo/posição |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

**Índices:**
- `idx_contacts_organization_id` em `organization_id`

**RLS:** Habilitado - Usuários autenticados podem gerenciar

---

### 5. `sponsorship_tiers` - Cotas de Patrocínio
Define as cotas de patrocínio disponíveis.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL | Nome da cota (ex: Title, Partner, Supplier) |
| `value_brl` | DECIMAL(12,2) | NOT NULL | Valor em reais |
| `description` | TEXT | | Descrição da cota |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

---

### 6. `sponsorship_counterparts` - Contra-partidas Padrão
Contra-partidas padrão associadas a cada cota de patrocínio.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `tier_id` | UUID | REFERENCES sponsorship_tiers(id) ON DELETE CASCADE | Cota relacionada |
| `name` | TEXT | NOT NULL | Nome da contra-partida |
| `included` | BOOLEAN | DEFAULT TRUE | Se está incluída por padrão |
| `details` | TEXT | | Detalhes da contra-partida |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

---

### 7. `pipeline_stages` - Estágios do Pipeline
Estágios do pipeline de vendas.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL | Nome do estágio |
| `position` | INTEGER | NOT NULL | Posição no pipeline |
| `color` | TEXT | DEFAULT '#3B82F6' | Cor do estágio |
| `is_lost` | BOOLEAN | DEFAULT FALSE | Se é um estágio de perda |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

---

### 8. `deals` - Oportunidades/Deals
Oportunidades de negócio (deals).

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `title` | TEXT | | Título/Observações (opcional) |
| `organization_id` | UUID | REFERENCES organizations(id) | Organização relacionada |
| `event_id` | UUID | REFERENCES events(id) NOT NULL | Evento relacionado |
| `stage_id` | UUID | REFERENCES pipeline_stages(id) | Estágio no pipeline |
| `sponsorship_tier_id` | UUID | REFERENCES sponsorship_tiers(id) | Cota de patrocínio |
| `type` | TEXT | CHECK | Tipo de relacionamento:<br>- `patrocinador`<br>- `parceiro`<br>- `expositor` |
| `value_monetary` | DECIMAL(12,2) | | Valor monetário |
| `value_barter` | DECIMAL(12,2) | | Valor em permuta |
| `currency` | TEXT | DEFAULT 'BRL' | Moeda |
| `barter_description` | TEXT | | Descrição da permuta |
| `stand_location` | TEXT | | Localização do estande (legado) |
| `expected_close_date` | DATE | | Data esperada de fechamento |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

**Índices:**
- `idx_deals_organization_id` em `organization_id`
- `idx_deals_event_id` em `event_id`
- `idx_deals_stage_id` em `stage_id`

**RLS:** Habilitado - Usuários autenticados podem gerenciar

---

### 9. `deal_stands` - Estandes dos Deals
Múltiplos estandes por deal (substitui `stand_location`).

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `deal_id` | UUID | REFERENCES deals(id) ON DELETE CASCADE NOT NULL | Deal relacionado |
| `stand_code` | TEXT | NOT NULL, CHECK, UNIQUE(deal_id, stand_code) | Código do estande (formato: A-F seguido de 2 dígitos, ex: A01) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**Índices:**
- `idx_deal_stands_deal_id` em `deal_id`
- `idx_deal_stands_stand_code` em `stand_code`

---

### 10. `deal_counterparts` - Contra-partidas Negociadas
Contra-partidas negociadas por deal (editáveis).

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `deal_id` | UUID | REFERENCES deals(id) ON DELETE CASCADE | Deal relacionado |
| `counterpart_id` | UUID | REFERENCES sponsorship_counterparts(id) | Contra-partida padrão (opcional) |
| `name` | TEXT | NOT NULL | Nome da contra-partida |
| `included` | BOOLEAN | DEFAULT TRUE | Se está incluída |
| `details` | TEXT | | Detalhes |
| `custom` | BOOLEAN | DEFAULT FALSE | Se é uma contra-partida customizada |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

**RLS:** Habilitado - Usuários autenticados podem gerenciar

---

### 11. `activities` - Atividades
Atividades relacionadas aos deals (chamadas, emails, reuniões, notas, tarefas).

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `deal_id` | UUID | REFERENCES deals(id) ON DELETE CASCADE | Deal relacionado |
| `type` | TEXT | CHECK | Tipo de atividade:<br>- `call`<br>- `email`<br>- `meeting`<br>- `note`<br>- `task` |
| `title` | TEXT | | Título (opcional, usado principalmente para tarefas) |
| `description` | TEXT | | Descrição da atividade |
| `activity_date` | TIMESTAMPTZ | NOT NULL | Data/hora da atividade |
| `next_action` | TEXT | | Próxima ação |
| `next_action_date` | TIMESTAMPTZ | | Data da próxima ação |
| `completed` | BOOLEAN | DEFAULT FALSE | Se está concluída |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**Índices:**
- `idx_activities_deal_id` em `deal_id`
- `idx_activities_type_completed_date` em `(type, completed, activity_date)`
- `idx_activities_open_tasks` em `(deal_id, activity_date)` WHERE `type = 'task' AND completed = false`

**RLS:** Habilitado - Usuários autenticados podem gerenciar

---

### 12. `deal_documents` - Documentos dos Deals
Referências a documentos armazenados no Supabase Storage.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `deal_id` | UUID | REFERENCES deals(id) ON DELETE CASCADE | Deal relacionado |
| `file_name` | TEXT | NOT NULL | Nome do arquivo |
| `file_path` | TEXT | NOT NULL | Caminho no storage |
| `file_size` | BIGINT | | Tamanho do arquivo |
| `mime_type` | TEXT | | Tipo MIME |
| `uploaded_by` | UUID | | ID do usuário que fez upload |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**Índices:**
- `idx_deal_documents_deal_id` em `deal_id`

**RLS:** Habilitado - Usuários autenticados podem gerenciar

---

### 13. `tags` - Tags
Tags para categorização de deals.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `name` | TEXT | NOT NULL, UNIQUE | Nome da tag |
| `color` | TEXT | NOT NULL, DEFAULT '#3B82F6' | Cor da tag |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**RLS:** Habilitado - Usuários autenticados podem gerenciar

---

### 14. `deal_tags` - Relacionamento Deal-Tag
Tabela de relacionamento many-to-many entre deals e tags.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `deal_id` | UUID | REFERENCES deals(id) ON DELETE CASCADE | Deal relacionado |
| `tag_id` | UUID | REFERENCES tags(id) ON DELETE CASCADE | Tag relacionada |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**Constraints:**
- UNIQUE(deal_id, tag_id) - Evita duplicatas

**Índices:**
- `idx_deal_tags_deal_id` em `deal_id`
- `idx_deal_tags_tag_id` em `tag_id`

**RLS:** Habilitado - Usuários autenticados podem gerenciar

---

### 15. `calendar_events` - Eventos do Calendário (Microsoft)
Sincronização com eventos do Microsoft Calendar.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `deal_id` | UUID | REFERENCES deals(id) | Deal relacionado |
| `microsoft_event_id` | TEXT | UNIQUE | ID do evento no Microsoft |
| `title` | TEXT | NOT NULL | Título do evento |
| `start_time` | TIMESTAMPTZ | NOT NULL | Data/hora de início |
| `end_time` | TIMESTAMPTZ | NOT NULL | Data/hora de término |
| `synced_at` | TIMESTAMPTZ | DEFAULT NOW() | Data da última sincronização |

**RLS:** Habilitado - Usuários autenticados podem gerenciar

---

### 16. `ai_messages` - Mensagens Geradas por IA
Mensagens geradas por IA para comunicação.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `deal_id` | UUID | REFERENCES deals(id) | Deal relacionado |
| `template_type` | TEXT | | Tipo de template |
| `prompt` | TEXT | NOT NULL | Prompt usado |
| `generated_text` | TEXT | NOT NULL | Texto gerado |
| `edited_text` | TEXT | | Texto editado pelo usuário |
| `sent` | BOOLEAN | DEFAULT FALSE | Se foi enviado |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |

**RLS:** Habilitado - Usuários autenticados podem gerenciar

---

### 17. `microsoft_tokens` - Tokens do Microsoft (OAuth)
Armazena tokens OAuth do Microsoft para integração.

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único |
| `user_id` | UUID | REFERENCES auth.users(id) ON DELETE CASCADE | Usuário relacionado |
| `access_token` | TEXT | NOT NULL | Token de acesso |
| `refresh_token` | TEXT | NOT NULL | Token de refresh |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Data de expiração |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de criação |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Data de atualização |

**Índices:**
- `idx_microsoft_tokens_user_id` UNIQUE em `user_id`

**RLS:** Habilitado - Usuários só podem gerenciar seus próprios tokens

---

## Row Level Security (RLS)

As seguintes tabelas têm RLS habilitado:

1. **organizations** - Usuários autenticados podem gerenciar
2. **contacts** - Usuários autenticados podem gerenciar
3. **deals** - Usuários autenticados podem gerenciar
4. **activities** - Usuários autenticados podem gerenciar
5. **deal_documents** - Usuários autenticados podem gerenciar
6. **deal_counterparts** - Usuários autenticados podem gerenciar
7. **calendar_events** - Usuários autenticados podem gerenciar
8. **ai_messages** - Usuários autenticados podem gerenciar
9. **microsoft_tokens** - Usuários só podem gerenciar seus próprios tokens
10. **tags** - Usuários autenticados podem gerenciar
11. **deal_tags** - Usuários autenticados podem gerenciar

**Tabelas públicas (sem RLS):**
- `events`
- `sectors`
- `pipeline_stages`
- `sponsorship_tiers`
- `sponsorship_counterparts`

---

## Relacionamentos Principais

1. **Organizations ↔ Contacts**: 1:N (uma organização tem muitos contatos)
2. **Organizations ↔ Deals**: 1:N (uma organização tem muitos deals)
3. **Events ↔ Deals**: 1:N (um evento tem muitos deals)
4. **Pipeline Stages ↔ Deals**: 1:N (um estágio tem muitos deals)
5. **Sponsorship Tiers ↔ Deals**: 1:N (uma cota tem muitos deals)
6. **Sponsorship Tiers ↔ Sponsorship Counterparts**: 1:N (uma cota tem muitas contra-partidas padrão)
7. **Deals ↔ Deal Counterparts**: 1:N (um deal tem muitas contra-partidas negociadas)
8. **Deals ↔ Activities**: 1:N (um deal tem muitas atividades)
9. **Deals ↔ Deal Documents**: 1:N (um deal tem muitos documentos)
10. **Deals ↔ Deal Stands**: 1:N (um deal pode ter muitos estandes)
11. **Deals ↔ Deal Tags**: N:M (muitos deals podem ter muitas tags)
12. **Deals ↔ Calendar Events**: 1:N (um deal pode ter muitos eventos no calendário)
13. **Deals ↔ AI Messages**: 1:N (um deal pode ter muitas mensagens de IA)
14. **Users ↔ Microsoft Tokens**: 1:1 (um usuário tem um token do Microsoft)

---

## Notas Importantes

1. **Campo `stand_location` em `deals`**: Mantido para compatibilidade, mas o novo sistema usa a tabela `deal_stands`.

2. **Campo `type` em `deals`**: Movido de `organizations` para `deals` na migração 004, pois o tipo de relacionamento está ligado ao deal, não à organização.

3. **Campo `title` em `deals`**: Tornado opcional na migração 005.

4. **Tipo `task` em `activities`**: Adicionado na migração 006 para suportar tarefas leves.

5. **Tabela `deal_stands`**: Criada na migração 007 para suportar múltiplos estandes por deal.

