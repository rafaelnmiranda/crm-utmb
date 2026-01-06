-- Migração: Mover campo 'type' de organizations para deals
-- O tipo de relacionamento (patrocinador, parceiro, expositor) agora está ligado ao Deal, não à Organization

-- 1. Adicionar campo 'type' na tabela deals (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'deals' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE deals
    ADD COLUMN type TEXT CHECK (type IN ('patrocinador', 'parceiro', 'expositor'));
  END IF;
END $$;

-- 2. Remover campo 'type' da tabela organizations (se existir)
DO $$
BEGIN
  -- Primeiro, remover a constraint CHECK se existir
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_name = 'organizations' 
    AND constraint_name = 'organizations_type_check'
  ) THEN
    ALTER TABLE organizations
    DROP CONSTRAINT organizations_type_check;
  END IF;
  
  -- Depois, remover a coluna se existir
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'organizations' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE organizations
    DROP COLUMN type;
  END IF;
END $$;
