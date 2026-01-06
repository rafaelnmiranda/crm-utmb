-- ============================================
-- QUERY: Entregáveis por Cota de Patrocínio
-- Mostra todos os entregáveis cadastrados em cada cota
-- ============================================

-- Versão 1: Resumo (quantidade de entregáveis por cota)
SELECT 
    st.name AS cota,
    st.value_brl AS valor_brl,
    COUNT(stc.id) AS total_entregaveis,
    COUNT(CASE WHEN stc.included = TRUE THEN 1 END) AS entregaveis_incluidos,
    COUNT(CASE WHEN stc.included = FALSE THEN 1 END) AS entregaveis_nao_incluidos
FROM sponsorship_tiers st
LEFT JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
GROUP BY st.id, st.name, st.value_brl
ORDER BY st.value_brl DESC;

-- Versão 2: Lista detalhada (todos os entregáveis de cada cota)
SELECT 
    st.name AS cota,
    st.value_brl AS valor_brl,
    stc.sort_order AS ordem,
    sc.name AS entregavel,
    CASE 
        WHEN stc.included = TRUE THEN 'Sim'
        ELSE 'Não'
    END AS incluido,
    COALESCE(stc.tier_details, sc.details, 'Sem detalhes') AS detalhes
FROM sponsorship_tiers st
LEFT JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
LEFT JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
ORDER BY st.value_brl DESC, stc.sort_order ASC, sc.name ASC;

-- Versão 3: Apenas cotas com entregáveis (mais limpa)
SELECT 
    st.name AS cota,
    st.value_brl AS valor_brl,
    stc.sort_order AS ordem,
    sc.name AS entregavel,
    CASE 
        WHEN stc.included = TRUE THEN '✓ Incluído'
        ELSE '✗ Não incluído'
    END AS status,
    LEFT(COALESCE(stc.tier_details, sc.details, 'Sem detalhes'), 100) AS detalhes_resumo
FROM sponsorship_tiers st
INNER JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
INNER JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
ORDER BY st.value_brl DESC, stc.sort_order ASC, sc.name ASC;

-- Versão 4: Cotas sem entregáveis (para identificar problemas)
SELECT 
    st.id,
    st.name AS cota,
    st.value_brl AS valor_brl,
    'SEM ENTREGÁVEIS CADASTRADOS' AS status
FROM sponsorship_tiers st
LEFT JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
WHERE stc.id IS NULL
ORDER BY st.value_brl DESC;

-- Versão 5: Contagem por cota (formato mais visual)
SELECT 
    CONCAT(st.name, ' (R$ ', TO_CHAR(st.value_brl, 'FM999,999,999.00'), ')') AS cota_completa,
    COUNT(stc.id) AS total_entregaveis,
    STRING_AGG(sc.name, ', ' ORDER BY stc.sort_order) AS lista_entregaveis
FROM sponsorship_tiers st
LEFT JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
LEFT JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
GROUP BY st.id, st.name, st.value_brl
ORDER BY st.value_brl DESC;
