-- Migração 010: Normalizar sponsorship_counterparts para entregáveis únicos
-- Cria tabela de relacionamento tier <-> counterpart e deduplica entregáveis

-- 1. Criar tabela de relacionamento tier <-> counterpart
-- (sem FK para counterpart_id ainda, será adicionada depois)
CREATE TABLE sponsorship_tier_counterparts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_id UUID NOT NULL REFERENCES sponsorship_tiers(id) ON DELETE CASCADE,
  counterpart_id UUID NOT NULL,
  included BOOLEAN DEFAULT TRUE,
  tier_details TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tier_id, counterpart_id)
);

CREATE INDEX idx_sponsorship_tier_counterparts_tier_id ON sponsorship_tier_counterparts(tier_id);
CREATE INDEX idx_sponsorship_tier_counterparts_counterpart_id ON sponsorship_tier_counterparts(counterpart_id);

-- 2. Função helper para normalizar nome (remover acentos básicos, lowercase, trim)
CREATE OR REPLACE FUNCTION normalize_counterpart_name(input_name TEXT)
RETURNS TEXT AS $$
DECLARE
  normalized TEXT;
BEGIN
  normalized := lower(trim(input_name));
  -- Remover acentos básicos
  normalized := replace(normalized, 'á', 'a');
  normalized := replace(normalized, 'à', 'a');
  normalized := replace(normalized, 'â', 'a');
  normalized := replace(normalized, 'ã', 'a');
  normalized := replace(normalized, 'ä', 'a');
  normalized := replace(normalized, 'é', 'e');
  normalized := replace(normalized, 'è', 'e');
  normalized := replace(normalized, 'ê', 'e');
  normalized := replace(normalized, 'ë', 'e');
  normalized := replace(normalized, 'í', 'i');
  normalized := replace(normalized, 'ì', 'i');
  normalized := replace(normalized, 'î', 'i');
  normalized := replace(normalized, 'ï', 'i');
  normalized := replace(normalized, 'ó', 'o');
  normalized := replace(normalized, 'ò', 'o');
  normalized := replace(normalized, 'ô', 'o');
  normalized := replace(normalized, 'õ', 'o');
  normalized := replace(normalized, 'ö', 'o');
  normalized := replace(normalized, 'ú', 'u');
  normalized := replace(normalized, 'ù', 'u');
  normalized := replace(normalized, 'û', 'u');
  normalized := replace(normalized, 'ü', 'u');
  normalized := replace(normalized, 'ç', 'c');
  normalized := replace(normalized, 'Â', 'a');
  normalized := replace(normalized, 'Ê', 'e');
  normalized := replace(normalized, 'Í', 'i');
  normalized := replace(normalized, 'Ó', 'o');
  normalized := replace(normalized, 'Ú', 'u');
  normalized := replace(normalized, 'Ç', 'c');
  -- Colapsar espaços múltiplos
  normalized := regexp_replace(normalized, '\\s+', ' ', 'g');
  RETURN trim(normalized);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Criar tabela temporária para identificar entregáveis únicos
-- Para cada nome normalizado, escolhemos o ID que tem o details mais longo
CREATE TEMP TABLE unique_counterpart_selection AS
SELECT DISTINCT ON (normalize_counterpart_name(name))
  id,
  name,
  details,
  normalize_counterpart_name(name) AS normalized_name
FROM sponsorship_counterparts
ORDER BY normalize_counterpart_name(name), length(coalesce(details, '')) DESC, id;

-- 4. Criar mapeamento: old_id -> selected_unique_id
CREATE TEMP TABLE counterpart_id_mapping AS
SELECT 
  sc.id AS old_id,
  ucs.id AS new_id,
  normalize_counterpart_name(sc.name) AS normalized_name
FROM sponsorship_counterparts sc
JOIN unique_counterpart_selection ucs 
  ON normalize_counterpart_name(sc.name) = ucs.normalized_name;

-- 5. Popular sponsorship_tier_counterparts com os relacionamentos
INSERT INTO sponsorship_tier_counterparts (tier_id, counterpart_id, included, tier_details)
SELECT 
  sc.tier_id,
  cm.new_id AS counterpart_id,
  sc.included,
  NULL AS tier_details
FROM sponsorship_counterparts sc
JOIN counterpart_id_mapping cm ON sc.id = cm.old_id
WHERE sc.tier_id IS NOT NULL;

-- 6. Adicionar foreign key constraint depois de popular (para evitar problema circular)
ALTER TABLE sponsorship_tier_counterparts 
  ADD CONSTRAINT sponsorship_tier_counterparts_counterpart_id_fkey 
  FOREIGN KEY (counterpart_id) REFERENCES sponsorship_counterparts(id) ON DELETE CASCADE;

-- 7. Atualizar deal_counterparts para usar os IDs únicos
UPDATE deal_counterparts dc
SET counterpart_id = cm.new_id
FROM counterpart_id_mapping cm
WHERE dc.counterpart_id = cm.old_id
  AND dc.counterpart_id != cm.new_id;  -- Só atualizar se for diferente

-- 8. Deletar registros duplicados de sponsorship_counterparts
-- Mantendo apenas os que estão em unique_counterpart_selection
DELETE FROM sponsorship_counterparts
WHERE id NOT IN (SELECT id FROM unique_counterpart_selection);

-- 9. Remover coluna tier_id e constraint de foreign key
ALTER TABLE sponsorship_counterparts DROP CONSTRAINT IF EXISTS sponsorship_counterparts_tier_id_fkey;
ALTER TABLE sponsorship_counterparts DROP COLUMN IF EXISTS tier_id;

-- 10. Adicionar constraint UNIQUE no name
ALTER TABLE sponsorship_counterparts ADD CONSTRAINT sponsorship_counterparts_name_unique UNIQUE (name);

-- 11. Limpar função temporária
DROP FUNCTION IF EXISTS normalize_counterpart_name(TEXT);
