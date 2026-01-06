-- Tabela de Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de relacionamento Deal-Tag (many-to-many)
CREATE TABLE deal_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(deal_id, tag_id)
);

-- Índices
CREATE INDEX idx_deal_tags_deal_id ON deal_tags(deal_id);
CREATE INDEX idx_deal_tags_tag_id ON deal_tags(tag_id);

-- Row Level Security
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_tags ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage tags"
ON tags FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage deal_tags"
ON deal_tags FOR ALL
USING (auth.uid() IS NOT NULL);

-- Tags padrão úteis para organização
INSERT INTO tags (name, color) VALUES
  ('Alta Prioridade', '#EF4444'),      -- Vermelho
  ('Urgente', '#F97316'),              -- Laranja
  ('Quente', '#EC4899'),               -- Rosa
  ('Proposta Enviada', '#3B82F6'),     -- Azul
  ('Aguardando Resposta', '#EAB308'),  -- Amarelo
  ('Negociação', '#A855F7'),           -- Roxo
  ('Patrocínio', '#10B981'),           -- Verde
  ('Parceria', '#06B6D4'),             -- Ciano
  ('Exposição', '#6B7280'),            -- Cinza
  ('Frio', '#93C5FD'),                 -- Azul claro
  ('Fechado', '#059669'),              -- Verde escuro
  ('Perdido', '#DC2626');              -- Vermelho escuro



