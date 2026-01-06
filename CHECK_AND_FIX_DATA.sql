-- ============================================
-- SCRIPT PARA VERIFICAR E CORRIGIR DADOS
-- Execute este script para diagnosticar o problema
-- ============================================

-- 1. Verificar quantos tiers existem
SELECT 'Tiers cadastrados:' AS info;
SELECT id, name, value_brl FROM sponsorship_tiers ORDER BY value_brl DESC;

-- 2. Verificar quantos counterparts existem
SELECT 'Counterparts cadastrados:' AS info;
SELECT COUNT(*) AS total FROM sponsorship_counterparts;

-- 3. Verificar quantos relacionamentos existem
SELECT 'Relacionamentos tier-counterpart:' AS info;
SELECT 
    st.name AS cota,
    st.value_brl AS valor,
    COUNT(stc.id) AS total_entregaveis
FROM sponsorship_tiers st
LEFT JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
GROUP BY st.id, st.name, st.value_brl
ORDER BY st.value_brl DESC;

-- 4. Verificar se há tiers sem entregáveis
SELECT 'Tiers SEM entregáveis:' AS info;
SELECT 
    st.id,
    st.name,
    st.value_brl
FROM sponsorship_tiers st
LEFT JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
WHERE stc.id IS NULL
ORDER BY st.value_brl DESC;

-- 5. Listar alguns counterparts para verificar nomes
SELECT 'Primeiros 10 counterparts:' AS info;
SELECT id, name FROM sponsorship_counterparts LIMIT 10;
