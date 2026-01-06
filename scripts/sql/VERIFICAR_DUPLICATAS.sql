-- ============================================
-- QUERIES: Verificar Duplicatas
-- Execute estas queries para identificar entregáveis duplicados
-- ============================================

-- 1. Verificar duplicatas em sponsorship_tier_counterparts
-- (mesma cota + mesmo entregável aparecendo mais de uma vez)
SELECT 
    st.name AS cota,
    sc.name AS entregavel,
    COUNT(*) AS quantidade_duplicatas,
    STRING_AGG(stc.id::text, ', ') AS ids_duplicados
FROM sponsorship_tier_counterparts stc
JOIN sponsorship_tiers st ON stc.tier_id = st.id
JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
GROUP BY st.id, st.name, sc.id, sc.name
HAVING COUNT(*) > 1
ORDER BY st.name, sc.name;

-- 2. Verificar entregáveis com nomes similares/duplicados em sponsorship_counterparts
SELECT 
    name AS nome_entregavel,
    COUNT(*) AS quantidade,
    STRING_AGG(id::text, ', ') AS ids
FROM sponsorship_counterparts
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;

-- 3. Verificar entregáveis com nomes muito similares (com espaços extras, etc)
SELECT 
    TRIM(LOWER(name)) AS nome_normalizado,
    COUNT(*) AS quantidade,
    STRING_AGG(name, ' | ') AS nomes_originais,
    STRING_AGG(id::text, ', ') AS ids
FROM sponsorship_counterparts
GROUP BY TRIM(LOWER(name))
HAVING COUNT(*) > 1
ORDER BY quantidade DESC;

-- 4. Ver todos os relacionamentos de uma cota específica (para debug)
-- Substitua o ID da cota abaixo
SELECT 
    stc.id AS relacionamento_id,
    st.name AS cota,
    sc.name AS entregavel,
    sc.id AS entregavel_id,
    stc.included,
    stc.sort_order
FROM sponsorship_tier_counterparts stc
JOIN sponsorship_tiers st ON stc.tier_id = st.id
JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
WHERE st.value_brl = 400000.00  -- Altere para a cota que quer verificar
ORDER BY stc.sort_order, sc.name;
