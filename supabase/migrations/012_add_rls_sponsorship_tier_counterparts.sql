-- Migração 012: Adicionar RLS para sponsorship_tier_counterparts
-- Esta tabela é de referência e deve ser acessível a usuários autenticados

-- Habilitar RLS
ALTER TABLE sponsorship_tier_counterparts ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários autenticados podem ler e gerenciar
CREATE POLICY "Users can manage sponsorship_tier_counterparts"
ON sponsorship_tier_counterparts FOR ALL
USING (auth.uid() IS NOT NULL);
