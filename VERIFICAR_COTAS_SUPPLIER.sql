-- ============================================
-- QUERY: Verificar Cotas Supplier
-- Execute esta query primeiro para ver quais cotas Supplier existem
-- ============================================

SELECT 
    id,
    name AS nome_cota,
    value_brl AS valor,
    description AS descricao
FROM sponsorship_tiers
WHERE LOWER(name) LIKE '%supplier%' 
   OR LOWER(name) LIKE '%suplier%'
   OR value_brl IN (130000.00, 90000.00, 60000.00)
ORDER BY value_brl DESC;

-- Verificar se essas cotas têm entregáveis
SELECT 
    st.id,
    st.name AS cota,
    st.value_brl AS valor,
    COUNT(stc.id) AS total_entregaveis
FROM sponsorship_tiers st
LEFT JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
WHERE LOWER(st.name) LIKE '%supplier%' 
   OR LOWER(st.name) LIKE '%suplier%'
   OR st.value_brl IN (130000.00, 90000.00, 60000.00)
GROUP BY st.id, st.name, st.value_brl
ORDER BY st.value_brl DESC;
