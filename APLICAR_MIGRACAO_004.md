# Aplicar Migração 004 - Corrigir Erro "Could not find the 'type' column"

## Erro
```
Could not find the 'type' column of 'deals' in the schema cache
```

## Solução
A migração `004_move_type_to_deals.sql` precisa ser aplicada ao banco de dados.

## Passo a Passo

### 1. Acesse o Supabase Dashboard
- URL: https://app.supabase.com/project/yytotgpwbnjpjyjkuiyn
- Vá em **SQL Editor** (menu lateral)

### 2. Execute a Migração
1. Clique em **New query**
2. Copie e cole o seguinte SQL:

```sql
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
```

3. Clique em **Run** (ou pressione `Cmd+Enter` / `Ctrl+Enter`)
4. Aguarde a execução completar

### 3. Verificar se Funcionou
Execute esta query para verificar se a coluna foi criada:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deals' 
AND column_name = 'type';
```

Você deve ver uma linha com `type` e `text`.

### 4. Testar Novamente
Após aplicar a migração, tente criar um novo deal novamente. O erro deve estar resolvido.

## Alternativa: Via Supabase CLI

Se você tiver o Supabase CLI configurado:

```bash
supabase link --project-ref yytotgpwbnjpjyjkuiyn
supabase db push
```

Isso aplicará todas as migrações pendentes, incluindo a 004.



