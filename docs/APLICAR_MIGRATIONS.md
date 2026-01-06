# Como Aplicar Migrations no Projeto Correto

## Projeto Supabase Correto
- **Project ID**: `yytotgpwbnjpjyjkuiyn`
- **URL**: `https://yytotgpwbnjpjyjkuiyn.supabase.co`

## Método 1: Via Supabase Dashboard (Mais Simples)

1. Acesse: https://app.supabase.com/project/yytotgpwbnjpjyjkuiyn
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Execute o SQL
5. Depois copie e cole o conteúdo de `supabase/migrations/002_seed_data.sql`
6. Execute o SQL

## Método 2: Via Supabase CLI (Recomendado)

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Link ao projeto correto
supabase link --project-ref yytotgpwbnjpjyjkuiyn

# Aplicar migrations
supabase db push
```

## Método 3: Via API do Supabase

Você pode usar a API Management do Supabase para aplicar migrations programaticamente, mas o método mais simples é via Dashboard ou CLI.

## Verificar se as migrations foram aplicadas

Após aplicar, verifique se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'organizations', 
    'contacts', 
    'deals', 
    'pipeline_stages', 
    'sponsorship_tiers',
    'sectors',
    'events'
  )
ORDER BY table_name;
```

## Nota sobre MCP

O MCP do Cursor está conectado a outro projeto. Para mudar:

1. Abra as configurações do Cursor (`Cmd + ,` ou `Ctrl + ,`)
2. Procure por "MCP" ou "Supabase"
3. Altere o `project_ref` para `yytotgpwbnjpjyjkuiyn`
4. Ou configure as variáveis de ambiente do MCP

A localização exata pode variar dependendo da versão do Cursor.




