-- ============================================
-- VERSÃO SIMPLIFICADA: Apenas adicionar RLS
-- Use este script se a tabela já existe
-- ============================================

-- Habilitar RLS
ALTER TABLE sponsorship_tier_counterparts ENABLE ROW LEVEL SECURITY;

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Users can manage sponsorship_tier_counterparts" 
    ON sponsorship_tier_counterparts;

-- Criar política RLS
CREATE POLICY "Users can manage sponsorship_tier_counterparts"
ON sponsorship_tier_counterparts FOR ALL
USING (auth.uid() IS NOT NULL);
