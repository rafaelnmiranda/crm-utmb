-- ============================================
-- SCRIPT: Adicionar Entregáveis às Cotas Supplier
-- Este script adiciona os entregáveis corretos para cada cota Supplier
-- Baseado na migração 009
-- ============================================

DO $$
DECLARE
    supplier_130_id UUID;
    supplier_90_id UUID;
    supplier_60_id UUID;
    counterpart_record RECORD;
    sort_order_counter INTEGER;
BEGIN
    -- Encontrar as cotas Supplier pelos valores
    -- Supplier R$ 130 Mil
    SELECT id INTO supplier_130_id 
    FROM sponsorship_tiers 
    WHERE value_brl = 130000.00 
    LIMIT 1;
    
    -- Supplier R$ 90 Mil
    SELECT id INTO supplier_90_id 
    FROM sponsorship_tiers 
    WHERE value_brl = 90000.00 
    LIMIT 1;
    
    -- Supplier R$ 60 Mil
    SELECT id INTO supplier_60_id 
    FROM sponsorship_tiers 
    WHERE value_brl = 60000.00 
    LIMIT 1;
    
    -- ============================================
    -- SUPPLIER R$ 130 MIL
    -- ============================================
    IF supplier_130_id IS NOT NULL THEN
        RAISE NOTICE 'Processando Supplier R$ 130 Mil (ID: %)', supplier_130_id;
        sort_order_counter := 0;
        
        -- Lista de entregáveis para Supplier R$ 130 Mil
        FOR counterpart_record IN 
            SELECT DISTINCT id, name 
            FROM sponsorship_counterparts 
            WHERE name IN (
                'Capa de Gradil',
                'VIP Experience',
                'Backdrop Finisher',
                'Windflag',
                'Guia do Atleta',
                'Logo/Link Site Oficial',
                'Kit do Atleta',
                'Backdrop',
                'Anúncio speaker',
                'Naming . Posto de Controle (PC)',
                'Estande Expo',
                'Social Mídia/E-mail MKT',
                'Assets Vídeos de Fotos',
                'Cortesia',
                'Talk Expo',
                'Vídeo Telão',
                'After Movie',
                'Permuta'
            )
            ORDER BY name
        LOOP
            -- Inserir se não existir
            INSERT INTO sponsorship_tier_counterparts (tier_id, counterpart_id, included, tier_details, sort_order)
            VALUES (supplier_130_id, counterpart_record.id, TRUE, NULL, sort_order_counter)
            ON CONFLICT (tier_id, counterpart_id) DO NOTHING;
            
            -- Incrementar contador sempre (mesmo que já exista)
            sort_order_counter := sort_order_counter + 1;
        END LOOP;
        
        RAISE NOTICE 'Supplier R$ 130 Mil: % entregáveis processados', sort_order_counter;
    ELSE
        RAISE WARNING 'Supplier R$ 130 Mil não encontrado!';
    END IF;
    
    -- ============================================
    -- SUPPLIER R$ 90 MIL
    -- ============================================
    IF supplier_90_id IS NOT NULL THEN
        RAISE NOTICE 'Processando Supplier R$ 90 Mil (ID: %)', supplier_90_id;
        sort_order_counter := 0;
        
        -- Lista de entregáveis para Supplier R$ 90 Mil
        FOR counterpart_record IN 
            SELECT DISTINCT id, name 
            FROM sponsorship_counterparts 
            WHERE name IN (
                'Guia do Atleta',
                'Logo/Link Site Oficial',
                'Kit do Atleta',
                'Backdrop',
                'Anúncio speaker',
                'Naming . Posto de Controle (PC)',
                'Estande Expo',
                'Social Mídia/E-mail MKT',
                'Assets Vídeos de Fotos',
                'Cortesia',
                'Talk Expo',
                'Vídeo Telão',
                'After Movie',
                'Permuta'
            )
            ORDER BY name
        LOOP
            -- Inserir se não existir
            INSERT INTO sponsorship_tier_counterparts (tier_id, counterpart_id, included, tier_details, sort_order)
            VALUES (supplier_90_id, counterpart_record.id, TRUE, NULL, sort_order_counter)
            ON CONFLICT (tier_id, counterpart_id) DO NOTHING;
            
            -- Incrementar contador sempre (mesmo que já exista)
            sort_order_counter := sort_order_counter + 1;
        END LOOP;
        
        RAISE NOTICE 'Supplier R$ 90 Mil: % entregáveis processados', sort_order_counter;
    ELSE
        RAISE WARNING 'Supplier R$ 90 Mil não encontrado!';
    END IF;
    
    -- ============================================
    -- SUPPLIER R$ 60 MIL
    -- ============================================
    IF supplier_60_id IS NOT NULL THEN
        RAISE NOTICE 'Processando Supplier R$ 60 Mil (ID: %)', supplier_60_id;
        sort_order_counter := 0;
        
        -- Lista de entregáveis para Supplier R$ 60 Mil (mesmos do R$ 90 Mil)
        FOR counterpart_record IN 
            SELECT DISTINCT id, name 
            FROM sponsorship_counterparts 
            WHERE name IN (
                'Guia do Atleta',
                'Logo/Link Site Oficial',
                'Kit do Atleta',
                'Backdrop',
                'Anúncio speaker',
                'Naming . Posto de Controle (PC)',
                'Estande Expo',
                'Social Mídia/E-mail MKT',
                'Assets Vídeos de Fotos',
                'Cortesia',
                'Talk Expo',
                'Vídeo Telão',
                'After Movie',
                'Permuta'
            )
            ORDER BY name
        LOOP
            -- Inserir se não existir
            INSERT INTO sponsorship_tier_counterparts (tier_id, counterpart_id, included, tier_details, sort_order)
            VALUES (supplier_60_id, counterpart_record.id, TRUE, NULL, sort_order_counter)
            ON CONFLICT (tier_id, counterpart_id) DO NOTHING;
            
            -- Incrementar contador sempre (mesmo que já exista)
            sort_order_counter := sort_order_counter + 1;
        END LOOP;
        
        RAISE NOTICE 'Supplier R$ 60 Mil: % entregáveis processados', sort_order_counter;
    ELSE
        RAISE WARNING 'Supplier R$ 60 Mil não encontrado!';
    END IF;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Processo concluído!';
    RAISE NOTICE '========================================';
END $$;

-- Verificar resultados
SELECT 
    st.name AS cota,
    TO_CHAR(st.value_brl, 'FM999,999,999.00') AS valor,
    COUNT(stc.id) AS total_entregaveis,
    STRING_AGG(sc.name, ', ' ORDER BY stc.sort_order) AS lista_entregaveis
FROM sponsorship_tiers st
LEFT JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
LEFT JOIN sponsorship_counterparts sc ON stc.counterpart_id = sc.id
WHERE st.value_brl IN (130000.00, 90000.00, 60000.00)
GROUP BY st.id, st.name, st.value_brl
ORDER BY st.value_brl DESC;
