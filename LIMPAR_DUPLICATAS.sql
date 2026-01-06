-- ============================================
-- SCRIPT: Limpar Duplicatas
-- Este script remove entregáveis duplicados
-- ============================================

-- ATENÇÃO: Execute primeiro VERIFICAR_DUPLICATAS.sql para ver o que será removido!

BEGIN;

-- 1. Remover duplicatas em sponsorship_tier_counterparts
-- Mantém apenas o primeiro registro (mais antigo) de cada combinação tier_id + counterpart_id
DELETE FROM sponsorship_tier_counterparts stc1
WHERE stc1.id NOT IN (
    SELECT DISTINCT ON (tier_id, counterpart_id)
        id
    FROM sponsorship_tier_counterparts
    ORDER BY tier_id, counterpart_id, created_at ASC, id ASC
);

-- Verificar quantos registros foram removidos
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RAISE NOTICE 'Removidos % registros duplicados de sponsorship_tier_counterparts', deleted_count;
END $$;

-- 2. Para entregáveis duplicados em sponsorship_counterparts:
-- Primeiro, vamos ver quais são os duplicados e escolher qual manter
-- (normalmente mantemos o que tem mais detalhes ou o ID menor)

-- Criar tabela temporária com os IDs que devem ser mantidos
CREATE TEMP TABLE counterpart_ids_to_keep AS
SELECT DISTINCT ON (TRIM(LOWER(name)))
    id,
    name,
    details,
    created_at
FROM sponsorship_counterparts
ORDER BY TRIM(LOWER(name)), 
         LENGTH(COALESCE(details, '')) DESC,  -- Preferir o que tem mais detalhes
         id ASC;  -- Se empate, manter o mais antigo

-- Criar mapeamento: old_id -> new_id para entregáveis duplicados
CREATE TEMP TABLE counterpart_id_mapping AS
SELECT 
    sc_old.id AS old_id,
    citk.id AS new_id,
    TRIM(LOWER(sc_old.name)) AS normalized_name
FROM sponsorship_counterparts sc_old
JOIN counterpart_ids_to_keep citk ON TRIM(LOWER(citk.name)) = TRIM(LOWER(sc_old.name))
WHERE sc_old.id != citk.id;  -- Apenas os que precisam ser mapeados

-- Identificar relacionamentos que precisam ser atualizados
CREATE TEMP TABLE relationships_to_update AS
SELECT 
    stc.id AS relationship_id,
    stc.tier_id,
    stc.counterpart_id AS old_counterpart_id,
    cm.new_id AS new_counterpart_id
FROM sponsorship_tier_counterparts stc
JOIN counterpart_id_mapping cm ON stc.counterpart_id = cm.old_id;

-- Para cada combinação tier_id + new_counterpart_id, manter apenas o relacionamento mais antigo
-- Os outros serão removidos (não atualizados)
CREATE TEMP TABLE relationships_to_remove AS
SELECT rtu1.relationship_id
FROM relationships_to_update rtu1
WHERE rtu1.relationship_id NOT IN (
    SELECT DISTINCT ON (tier_id, new_counterpart_id)
        relationship_id
    FROM relationships_to_update
    ORDER BY tier_id, new_counterpart_id, relationship_id ASC
);

-- Remover relacionamentos que criariam duplicatas
DELETE FROM sponsorship_tier_counterparts
WHERE id IN (SELECT relationship_id FROM relationships_to_remove);

-- Atualizar os relacionamentos restantes
UPDATE sponsorship_tier_counterparts stc
SET counterpart_id = rtu.new_counterpart_id
FROM relationships_to_update rtu
WHERE stc.id = rtu.relationship_id
AND stc.id NOT IN (SELECT relationship_id FROM relationships_to_remove);

-- Limpar tabelas temporárias (mas manter counterpart_id_mapping por enquanto)
DROP TABLE relationships_to_remove;
DROP TABLE relationships_to_update;

-- Atualizar deal_counterparts que apontam para entregáveis que serão removidos
UPDATE deal_counterparts dc
SET counterpart_id = cm.new_id
FROM counterpart_id_mapping cm
WHERE dc.counterpart_id = cm.old_id;

-- Agora podemos remover entregáveis duplicados (mantendo apenas os da tabela temporária)
DELETE FROM sponsorship_counterparts
WHERE id NOT IN (SELECT id FROM counterpart_ids_to_keep);

-- Limpar tabela temporária de mapeamento
DROP TABLE counterpart_id_mapping;

-- Verificar quantos foram removidos
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO deleted_count
    FROM sponsorship_counterparts
    WHERE id NOT IN (SELECT id FROM counterpart_ids_to_keep);
    
    RAISE NOTICE 'Removidos % entregáveis duplicados de sponsorship_counterparts', deleted_count;
END $$;

-- Limpar tabela temporária
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
