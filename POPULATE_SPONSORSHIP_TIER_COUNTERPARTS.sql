-- ============================================
-- SCRIPT PARA POPULAR sponsorship_tier_counterparts
-- Este script popula a tabela com os dados corretos
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sponsorship_tier_counterparts'
    ) THEN
        RAISE EXCEPTION 'A tabela sponsorship_tier_counterparts não existe. Execute primeiro o script FIX_SPONSORSHIP_TIER_COUNTERPARTS.sql';
    END IF;
END $$;

-- 2. Limpar dados existentes (opcional - descomente se quiser recriar tudo)
-- DELETE FROM sponsorship_tier_counterparts;

-- 3. Popular sponsorship_tier_counterparts a partir de sponsorship_counterparts
-- Este script assume que sponsorship_counterparts já tem os dados da migração 009
-- e que sponsorship_tiers tem as cotas cadastradas

DO $$
DECLARE
    tier_record RECORD;
    counterpart_record RECORD;
    tier_counterpart_id UUID;
    counterpart_unique_id UUID;
    inserted_count INTEGER := 0;
BEGIN
    -- Para cada cota (tier)
    FOR tier_record IN 
        SELECT id, name, value_brl 
        FROM sponsorship_tiers 
        ORDER BY value_brl DESC
    LOOP
        RAISE NOTICE 'Processando cota: % (ID: %)', tier_record.name, tier_record.id;
        
        -- Buscar todos os counterparts que pertencem a esta cota
        -- Como a coluna tier_id foi removida, vamos usar o nome e valor para identificar
        -- Baseado na migração 009, sabemos quais entregáveis pertencem a cada cota
        
        -- Title (R$ 1.5 MM)
        IF tier_record.name = 'Title' AND tier_record.value_brl = 1500000.00 THEN
            FOR counterpart_record IN 
                SELECT DISTINCT id, name 
                FROM sponsorship_counterparts 
                WHERE name IN (
                    'Nome da prova/Camiseta', 'Gift Finisher', 'Kit do Atleta', 
                    'Champions Zone', 'VIP Experience', 'Anúncio speaker', 
                    'Guia do Atleta', 'Backdrop Finisher', 'Backdrop', 
                    'Pórtico de Largada/Chegada', 'Capa de Gradil', 
                    'Logo/Link Site Oficial', 'Windflag', 
                    'Naming . Posto de Controle (PC)', 'Estande Expo', 
                    'Social Mídia/E-mail MKT', 'Assets Vídeos de Fotos', 
                    'Cortesia', 'Talk Expo', 'Vídeo Telão', 'After Movie', 'Permuta'
                )
            LOOP
                -- Verificar se já existe o relacionamento
                IF NOT EXISTS (
                    SELECT 1 FROM sponsorship_tier_counterparts 
                    WHERE tier_id = tier_record.id 
                    AND counterpart_id = counterpart_record.id
                ) THEN
                    INSERT INTO sponsorship_tier_counterparts (tier_id, counterpart_id, included, tier_details, sort_order)
                    VALUES (tier_record.id, counterpart_record.id, TRUE, NULL, inserted_count)
                    ON CONFLICT (tier_id, counterpart_id) DO NOTHING;
                    inserted_count := inserted_count + 1;
                END IF;
            END LOOP;
        END IF;
        
        -- Partner (R$ 400 Mil)
        IF tier_record.name = 'Partner' AND tier_record.value_brl = 400000.00 THEN
            FOR counterpart_record IN 
                SELECT DISTINCT id, name 
                FROM sponsorship_counterparts 
                WHERE name IN (
                    'Pórtico de Largada/Chegada', 'Champions Zone', 'Capa de Gradil', 
                    'VIP Experience', 'Backdrop Finisher', 'Windflag', 
                    'Guia do Atleta', 'Logo/Link Site Oficial', 'Kit do Atleta', 
                    'Backdrop', 'Anúncio speaker', 'Naming . Posto de Controle (PC)', 
                    'Estande Expo', 'Social Mídia/E-mail MKT', 'Assets Vídeos de Fotos', 
                    'Cortesia', 'Talk Expo', 'Vídeo Telão', 'After Movie', 'Permuta'
                )
            LOOP
                IF NOT EXISTS (
                    SELECT 1 FROM sponsorship_tier_counterparts 
                    WHERE tier_id = tier_record.id 
                    AND counterpart_id = counterpart_record.id
                ) THEN
                    INSERT INTO sponsorship_tier_counterparts (tier_id, counterpart_id, included, tier_details, sort_order)
                    VALUES (tier_record.id, counterpart_record.id, TRUE, NULL, inserted_count)
                    ON CONFLICT (tier_id, counterpart_id) DO NOTHING;
                    inserted_count := inserted_count + 1;
                END IF;
            END LOOP;
        END IF;
        
        -- Supplier R$ 130 Mil
        IF tier_record.name = 'Supplier' AND tier_record.value_brl = 130000.00 THEN
            FOR counterpart_record IN 
                SELECT DISTINCT id, name 
                FROM sponsorship_counterparts 
                WHERE name IN (
                    'Capa de Gradil', 'VIP Experience', 'Backdrop Finisher', 
                    'Windflag', 'Guia do Atleta', 'Logo/Link Site Oficial', 
                    'Kit do Atleta', 'Backdrop', 'Anúncio speaker', 
                    'Naming . Posto de Controle (PC)', 'Estande Expo', 
                    'Social Mídia/E-mail MKT', 'Assets Vídeos de Fotos', 
                    'Cortesia', 'Talk Expo', 'Vídeo Telão', 'After Movie', 'Permuta'
                )
            LOOP
                IF NOT EXISTS (
                    SELECT 1 FROM sponsorship_tier_counterparts 
                    WHERE tier_id = tier_record.id 
                    AND counterpart_id = counterpart_record.id
                ) THEN
                    INSERT INTO sponsorship_tier_counterparts (tier_id, counterpart_id, included, tier_details, sort_order)
                    VALUES (tier_record.id, counterpart_record.id, TRUE, NULL, inserted_count)
                    ON CONFLICT (tier_id, counterpart_id) DO NOTHING;
                    inserted_count := inserted_count + 1;
                END IF;
            END LOOP;
        END IF;
        
        -- Supplier R$ 90 Mil
        IF tier_record.name = 'Supplier' AND tier_record.value_brl = 90000.00 THEN
            FOR counterpart_record IN 
                SELECT DISTINCT id, name 
                FROM sponsorship_counterparts 
                WHERE name IN (
                    'Guia do Atleta', 'Logo/Link Site Oficial', 'Kit do Atleta', 
                    'Backdrop', 'Anúncio speaker', 'Naming . Posto de Controle (PC)', 
                    'Estande Expo', 'Social Mídia/E-mail MKT', 'Assets Vídeos de Fotos', 
                    'Cortesia', 'Talk Expo', 'Vídeo Telão', 'After Movie', 'Permuta'
                )
            LOOP
                IF NOT EXISTS (
                    SELECT 1 FROM sponsorship_tier_counterparts 
                    WHERE tier_id = tier_record.id 
                    AND counterpart_id = counterpart_record.id
                ) THEN
                    INSERT INTO sponsorship_tier_counterparts (tier_id, counterpart_id, included, tier_details, sort_order)
                    VALUES (tier_record.id, counterpart_record.id, TRUE, NULL, inserted_count)
                    ON CONFLICT (tier_id, counterpart_id) DO NOTHING;
                    inserted_count := inserted_count + 1;
                END IF;
            END LOOP;
        END IF;
        
        -- Supplier R$ 60 Mil
        IF tier_record.name = 'Supplier' AND tier_record.value_brl = 60000.00 THEN
            FOR counterpart_record IN 
                SELECT DISTINCT id, name 
                FROM sponsorship_counterparts 
                WHERE name IN (
                    'Guia do Atleta', 'Logo/Link Site Oficial', 'Kit do Atleta', 
                    'Backdrop', 'Anúncio speaker', 'Naming . Posto de Controle (PC)', 
                    'Estande Expo', 'Social Mídia/E-mail MKT', 'Assets Vídeos de Fotos', 
                    'Cortesia', 'Talk Expo', 'Vídeo Telão', 'After Movie', 'Permuta'
                )
            LOOP
                IF NOT EXISTS (
                    SELECT 1 FROM sponsorship_tier_counterparts 
                    WHERE tier_id = tier_record.id 
                    AND counterpart_id = counterpart_record.id
                ) THEN
                    INSERT INTO sponsorship_tier_counterparts (tier_id, counterpart_id, included, tier_details, sort_order)
                    VALUES (tier_record.id, counterpart_record.id, TRUE, NULL, inserted_count)
                    ON CONFLICT (tier_id, counterpart_id) DO NOTHING;
                    inserted_count := inserted_count + 1;
                END IF;
            END LOOP;
        END IF;
        
        RAISE NOTICE 'Cota % processada. % relacionamentos criados.', tier_record.name, inserted_count;
        inserted_count := 0;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Processo concluído!';
    RAISE NOTICE '========================================';
END $$;

-- 4. Verificar resultados
SELECT 
    st.name AS cota,
    st.value_brl AS valor,
    COUNT(stc.id) AS total_entregaveis
FROM sponsorship_tiers st
LEFT JOIN sponsorship_tier_counterparts stc ON st.id = stc.tier_id
GROUP BY st.id, st.name, st.value_brl
ORDER BY st.value_brl DESC;
