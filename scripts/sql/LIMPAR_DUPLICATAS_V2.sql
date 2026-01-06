-- ============================================
-- SCRIPT: Limpar Duplicatas (Versão 2 - Mais Segura)
-- Este script remove entregáveis duplicados de forma mais segura
-- ============================================

BEGIN;

-- PASSO 1: Remover duplicatas diretas em sponsorship_tier_counterparts
-- (mesma cota + mesmo entregável aparecendo mais de uma vez)
DELETE FROM sponsorship_tier_counterparts stc1
WHERE stc1.id NOT IN (
    SELECT DISTINCT ON (tier_id, counterpart_id)
        id
    FROM sponsorship_tier_counterparts
    ORDER BY tier_id, counterpart_id, created_at ASC, id ASC
);

DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'PASSO 1: Removidos % registros duplicados diretos de sponsorship_tier_counterparts', deleted_count;
END $$;

-- PASSO 2: Identificar entregáveis duplicados e criar mapeamento
CREATE TEMP TABLE counterpart_ids_to_keep AS
SELECT DISTINCT ON (TRIM(LOWER(name)))
    id,
    name,
    details,
    created_at
FROM sponsorship_counterparts
ORDER BY TRIM(LOWER(name)), 
         LENGTH(COALESCE(details, '')) DESC,
         id ASC;

-- Criar mapeamento old_id -> new_id
CREATE TEMP TABLE counterpart_id_mapping AS
SELECT 
    sc_old.id AS old_id,
    citk.id AS new_id
FROM sponsorship_counterparts sc_old
JOIN counterpart_ids_to_keep citk ON TRIM(LOWER(citk.name)) = TRIM(LOWER(sc_old.name))
WHERE sc_old.id != citk.id;

-- PASSO 3: Para cada relacionamento que aponta para um entregável duplicado,
-- verificar se ao atualizar criaria duplicata. Se sim, remover. Se não, atualizar.

-- Identificar relacionamentos que apontam para entregáveis que serão removidos
CREATE TEMP TABLE relationships_affected AS
SELECT 
    stc.id AS relationship_id,
    stc.tier_id,
    stc.counterpart_id AS old_counterpart_id,
    cm.new_id AS new_counterpart_id
FROM sponsorship_tier_counterparts stc
JOIN counterpart_id_mapping cm ON stc.counterpart_id = cm.old_id;

-- Verificar quais relacionamentos, após atualização, criariam duplicatas
-- (já existe um relacionamento com tier_id + new_counterpart_id)
CREATE TEMP TABLE would_create_duplicate AS
SELECT ra.relationship_id
FROM relationships_affected ra
WHERE EXISTS (
    SELECT 1 
    FROM sponsorship_tier_counterparts stc_existing
    WHERE stc_existing.tier_id = ra.tier_id
    AND stc_existing.counterpart_id = ra.new_counterpart_id
    AND stc_existing.id != ra.relationship_id
);

-- Remover relacionamentos que criariam duplicatas
DELETE FROM sponsorship_tier_counterparts
WHERE id IN (SELECT relationship_id FROM would_create_duplicate);

DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO deleted_count FROM would_create_duplicate;
    RAISE NOTICE 'PASSO 3: Removidos % relacionamentos que criariam duplicatas', deleted_count;
END $$;

-- Atualizar os relacionamentos restantes
UPDATE sponsorship_tier_counterparts stc
SET counterpart_id = ra.new_counterpart_id
FROM relationships_affected ra
WHERE stc.id = ra.relationship_id
AND stc.id NOT IN (SELECT relationship_id FROM would_create_duplicate);

DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'PASSO 4: Atualizados % relacionamentos para usar entregáveis únicos', updated_count;
END $$;

-- PASSO 5: Atualizar deal_counterparts que apontam para entregáveis que serão removidos
UPDATE deal_counterparts dc
SET counterpart_id = cm.new_id
FROM counterpart_id_mapping cm
WHERE dc.counterpart_id = cm.old_id;

DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'PASSO 5: Atualizados % deal_counterparts para usar entregáveis únicos', updated_count;
END $$;

-- PASSO 6: Remover entregáveis duplicados (agora que não há mais referências)
DELETE FROM sponsorship_counterparts
WHERE id NOT IN (SELECT id FROM counterpart_ids_to_keep);

DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'PASSO 6: Removidos % entregáveis duplicados', deleted_count;
END $$;

-- Limpar tabelas temporárias
DROP TABLE would_create_duplicate;
DROP TABLE relationships_affected;
DROP TABLE counterpart_id_mapping;
DROP TABLE counterpart_ids_to_keep;

-- Verificar resultados finais
SELECT 
    'sponsorship_tier_counterparts' AS tabela,
    COUNT(*) AS total_registros,
    COUNT(DISTINCT tier_id || '-' || counterpart_id) AS relacionamentos_unicos
FROM sponsorship_tier_counterparts
UNION ALL
SELECT 
    'sponsorship_counterparts' AS tabela,
    COUNT(*) AS total_registros,
    COUNT(DISTINCT TRIM(LOWER(name))) AS nomes_unicos
FROM sponsorship_counterparts;

COMMIT;

-- Se algo der errado, execute ROLLBACK; antes de COMMIT;
