-- Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  year INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setores (classificação UTMB)
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN (
    'event_requirement',
    'protected_transitional',
    'restricted_1',
    'restricted_2',
    'prohibited',
    'open'
  )),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizações (clientes)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('patrocinador', 'parceiro', 'expositor')),
  partner_subcategory TEXT CHECK (partner_subcategory IN ('pousada', 'restaurante', 'outro')),
  website TEXT,
  sector_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contatos (pessoas)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cotas de Patrocínio
CREATE TABLE sponsorship_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value_brl DECIMAL(12,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contra-partidas padrão por cota
CREATE TABLE sponsorship_counterparts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID REFERENCES sponsorship_tiers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  included BOOLEAN DEFAULT TRUE,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estágios do Pipeline
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_lost BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals (Oportunidades)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  event_id UUID REFERENCES events(id) NOT NULL,
  stage_id UUID REFERENCES pipeline_stages(id),
  sponsorship_tier_id UUID REFERENCES sponsorship_tiers(id),
  value_monetary DECIMAL(12,2),
  value_barter DECIMAL(12,2),
  currency TEXT DEFAULT 'BRL',
  barter_description TEXT,
  stand_location TEXT,
  expected_close_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contra-partidas negociadas por deal (editáveis)
CREATE TABLE deal_counterparts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  counterpart_id UUID REFERENCES sponsorship_counterparts(id),
  name TEXT NOT NULL,
  included BOOLEAN DEFAULT TRUE,
  details TEXT,
  custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atividades
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('call', 'email', 'meeting', 'note')),
  description TEXT,
  activity_date TIMESTAMPTZ NOT NULL,
  next_action TEXT,
  next_action_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documentos dos Deals (referências ao Supabase Storage)
CREATE TABLE deal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos do Calendário (Microsoft)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id),
  microsoft_event_id TEXT UNIQUE,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensagens geradas por IA
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id),
  template_type TEXT,
  prompt TEXT NOT NULL,
  generated_text TEXT NOT NULL,
  edited_text TEXT,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tokens do Microsoft (para OAuth)
CREATE TABLE microsoft_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX idx_microsoft_tokens_user_id ON microsoft_tokens(user_id);
CREATE INDEX idx_deals_organization_id ON deals(organization_id);
CREATE INDEX idx_deals_event_id ON deals(event_id);
CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_deal_documents_deal_id ON deal_documents(deal_id);

-- Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_counterparts ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE microsoft_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (usuários autenticados podem fazer tudo)
CREATE POLICY "Users can manage organizations"
ON organizations FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage contacts"
ON contacts FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage deals"
ON deals FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage activities"
ON activities FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage deal_documents"
ON deal_documents FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage deal_counterparts"
ON deal_counterparts FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage calendar_events"
ON calendar_events FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage ai_messages"
ON ai_messages FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their microsoft_tokens"
ON microsoft_tokens FOR ALL
USING (auth.uid() = user_id);

-- Tabelas públicas (sem RLS necessário)
-- events, sectors, pipeline_stages, sponsorship_tiers, sponsorship_counterparts
-- são dados de referência que todos podem ler




