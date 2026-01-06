-- ============================================
-- QUERY SIMPLES: Ver Entregáveis por Cota
-- Execute esta query para ver todos os entregáveis de cada cota
-- ============================================

SELECT 
    st.name AS "Cota",
    TO_CHAR(st.value_brl, 'FM999,999,999.00') AS "Valor (R$)",
    sc.name AS "Entregável",
    CASE 
        WHEN stc.included = TRUE THEN '✓ Sim'
        ELSE '✗ Não'
    END AS "Incluído",
    COALESCE(stc.tier_details, sc.details) AS "Detalhes"
FROM sponsorship_tiers st
INNER JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
INNER JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
ORDER BY 
    st.value_brl DESC,
    stc.sort_order ASC,
    sc.name ASC;
