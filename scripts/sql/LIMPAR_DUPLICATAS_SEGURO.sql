-- ============================================
-- SCRIPT: Limpar Duplicatas (Versão Segura)
-- Esta versão mostra o que será feito antes de executar
-- ============================================

-- PASSO 1: Ver duplicatas em sponsorship_tier_counterparts
SELECT 
    'DUPLICATAS em sponsorship_tier_counterparts:' AS tipo,
    st.name AS cota,
    sc.name AS entregavel,
    COUNT(*) AS quantidade,
    STRING_AGG(stc.id::text, ', ') AS ids_que_serao_mantidos_removidos
FROM sponsorship_tier_counterparts stc
JOIN sponsorship_tiers st ON stc.tier_id = st.id
JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
GROUP BY st.id, st.name, sc.id, sc.name
HAVING COUNT(*) > 1
ORDER BY st.name, sc.name;

-- PASSO 2: Ver quais serão mantidos e quais serão removidos
-- (mantém o primeiro ID de cada duplicata, ordenado por created_at)
SELECT 
    'RELACIONAMENTOS que SERÃO MANTIDOS:' AS acao,
    stc.id AS id_mantido,
    st.name AS cota,
    sc.name AS entregavel,
    stc.created_at
FROM sponsorship_tier_counterparts stc
JOIN sponsorship_tiers st ON stc.tier_id = st.id
JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
WHERE stc.id IN (
    SELECT DISTINCT ON (tier_id, counterpart_id)
        id
    FROM sponsorship_tier_counterparts
    ORDER BY tier_id, counterpart_id, created_at ASC, id ASC
)
ORDER BY st.name, sc.name;

SELECT 
    'RELACIONAMENTOS que SERÃO REMOVIDOS:' AS acao,
    stc.id AS id_removido,
    st.name AS cota,
    sc.name AS entregavel,
    stc.created_at
FROM sponsorship_tier_counterparts stc
JOIN sponsorship_tiers st ON stc.tier_id = st.id
JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
WHERE stc.id NOT IN (
    SELECT DISTINCT ON (tier_id, counterpart_id)
        id
    FROM sponsorship_tier_counterparts
    ORDER BY tier_id, counterpart_id, created_at ASC, id ASC
)
ORDER BY st.name, sc.name;

-- PASSO 3: Ver entregáveis duplicados em sponsorship_counterparts
SELECT 
    'ENTREGÁVEIS DUPLICADOS:' AS tipo,
    name AS nome,
    COUNT(*) AS quantidade,
    STRING_AGG(id::text, ', ') AS ids
FROM sponsorship_counterparts
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY name;

-- PASSO 4: Ver qual entregável será mantido para cada nome duplicado
-- (mantém o que tem mais detalhes ou o ID menor)
SELECT 
    'ENTREGÁVEIS que SERÃO MANTIDOS:' AS acao,
    id AS id_mantido,
    name AS nome,
    LEFT(COALESCE(details, 'Sem detalhes'), 50) AS detalhes_resumo
FROM (
    SELECT DISTINCT ON (TRIM(LOWER(name)))
        id,
        name,
        details,
        created_at
    FROM sponsorship_counterparts
    ORDER BY TRIM(LOWER(name)), 
             LENGTH(COALESCE(details, '')) DESC,
             id ASC
) AS mantidos
ORDER BY name;

-- PASSO 5: Ver quais entregáveis serão removidos
SELECT 
    'ENTREGÁVEIS que SERÃO REMOVIDOS:' AS acao,
    sc.id AS id_removido,
    sc.name AS nome,
    LEFT(COALESCE(sc.details, 'Sem detalhes'), 50) AS detalhes_resumo
FROM sponsorship_counterparts sc
WHERE sc.id NOT IN (
    SELECT DISTINCT ON (TRIM(LOWER(name)))
        id
    FROM sponsorship_counterparts
    ORDER BY TRIM(LOWER(name)), 
             LENGTH(COALESCE(details, '')) DESC,
             id ASC
)
ORDER BY sc.name;

-- ============================================
-- APÓS REVISAR OS RESULTADOS ACIMA,
-- Execute o script LIMPAR_DUPLICATAS.sql para aplicar as mudanças
-- ============================================
