-- ============================================
-- SCRIPT PARA CORRIGIR sponsorship_tier_counterparts
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- 1. Verificar e criar a tabela se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sponsorship_tier_counterparts'
    ) THEN
        -- Criar a tabela
        CREATE TABLE sponsorship_tier_counterparts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tier_id UUID NOT NULL REFERENCES sponsorship_tiers(id) ON DELETE CASCADE,
            counterpart_id UUID NOT NULL,
            included BOOLEAN DEFAULT TRUE,
            tier_details TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(tier_id, counterpart_id)
        );

        -- Criar índices
        CREATE INDEX idx_sponsorship_tier_counterparts_tier_id 
            ON sponsorship_tier_counterparts(tier_id);
        CREATE INDEX idx_sponsorship_tier_counterparts_counterpart_id 
            ON sponsorship_tier_counterparts(counterpart_id);

        -- Adicionar foreign key constraint se a tabela sponsorship_counterparts existir
        IF EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'sponsorship_counterparts'
        ) THEN
            ALTER TABLE sponsorship_tier_counterparts 
            ADD CONSTRAINT sponsorship_tier_counterparts_counterpart_id_fkey 
            FOREIGN KEY (counterpart_id) REFERENCES sponsorship_counterparts(id) ON DELETE CASCADE;
        END IF;

        RAISE NOTICE 'Tabela sponsorship_tier_counterparts criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela sponsorship_tier_counterparts já existe.';
    END IF;
END $$;

-- 2. Habilitar RLS (se ainda não estiver habilitado)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'sponsorship_tier_counterparts'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE sponsorship_tier_counterparts ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado na tabela sponsorship_tier_counterparts';
    ELSE
        RAISE NOTICE 'RLS já está habilitado na tabela sponsorship_tier_counterparts';
    END IF;
END $$;

-- 3. Criar política RLS (remover se existir e criar nova)
DROP POLICY IF EXISTS "Users can manage sponsorship_tier_counterparts" 
    ON sponsorship_tier_counterparts;

CREATE POLICY "Users can manage sponsorship_tier_counterparts"
ON sponsorship_tier_counterparts FOR ALL
USING (auth.uid() IS NOT NULL);

-- 4. Verificar se tudo está correto
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Verificação final:';
    RAISE NOTICE '========================================';
    
    -- Verificar se a tabela existe
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sponsorship_tier_counterparts'
    ) THEN
        RAISE NOTICE '✓ Tabela sponsorship_tier_counterparts existe';
    ELSE
        RAISE WARNING '✗ Tabela sponsorship_tier_counterparts NÃO existe';
    END IF;

    -- Verificar se RLS está habilitado
    IF EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'sponsorship_tier_counterparts'
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✓ RLS está habilitado';
    ELSE
        RAISE WARNING '✗ RLS NÃO está habilitado';
    END IF;

    -- Verificar se a política existe
    IF EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'sponsorship_tier_counterparts'
        AND policyname = 'Users can manage sponsorship_tier_counterparts'
    ) THEN
        RAISE NOTICE '✓ Política RLS existe';
    ELSE
        RAISE WARNING '✗ Política RLS NÃO existe';
    END IF;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Script concluído!';
    RAISE NOTICE '========================================';
END $$;
