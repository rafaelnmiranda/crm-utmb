-- ============================================
-- QUERY: Verificar Resultado Final
-- Execute esta query para confirmar que não há mais duplicatas
-- ============================================

-- 1. Verificar se há duplicatas em sponsorship_tier_counterparts
SELECT 
    'Verificação de duplicatas em sponsorship_tier_counterparts:' AS verificacao,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT tier_id || '-' || counterpart_id) 
        THEN '✓ SEM DUPLICATAS'
        ELSE '✗ AINDA HÁ DUPLICATAS'
    END AS status
FROM sponsorship_tier_counterparts;

-- 2. Verificar se há entregáveis com nomes duplicados
SELECT 
    'Verificação de nomes duplicados em sponsorship_counterparts:' AS verificacao,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT TRIM(LOWER(name))) 
        THEN '✓ SEM DUPLICATAS'
        ELSE '✗ AINDA HÁ DUPLICATAS'
    END AS status
FROM sponsorship_counterparts;

-- 3. Listar todos os entregáveis únicos por cota
SELECT 
    st.name AS cota,
    TO_CHAR(st.value_brl, 'FM999,999,999.00') AS valor,
    COUNT(DISTINCT stc.counterpart_id) AS total_entregaveis_unicos,
    STRING_AGG(DISTINCT sc.name, ', ' ORDER BY sc.name) AS lista_entregaveis
FROM sponsorship_tiers st
LEFT JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
LEFT JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
GROUP BY st.id, st.name, st.value_brl
ORDER BY st.value_brl DESC;

-- 4. Verificar se há deal_counterparts apontando para entregáveis que não existem mais
SELECT 
    'Verificação de referências órfãs em deal_counterparts:' AS verificacao,
    COUNT(*) AS referencias_orfas
FROM deal_counterparts dc
WHERE dc.counterpart_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM sponsorship_counterparts sc 
    WHERE sc.id = dc.counterpart_id
);

-- 5. Resumo final
SELECT 
    'RESUMO FINAL' AS tipo,
    (SELECT COUNT(*) FROM sponsorship_tiers) AS total_cotas,
    (SELECT COUNT(*) FROM sponsorship_counterparts) AS total_entregaveis_unicos,
    (SELECT COUNT(*) FROM sponsorship_tier_counterparts) AS total_relacionamentos,
    (SELECT COUNT(DISTINCT tier_id || '-' || counterpart_id) FROM sponsorship_tier_counterparts) AS relacionamentos_unicos;
