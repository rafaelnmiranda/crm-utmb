# Como Aplicar Migrations via Dashboard do Supabase

## Passo a Passo

### 1. Acesse o SQL Editor

1. Abra: https://app.supabase.com/project/yytotgpwbnjpjyjkuiyn
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New query**

### 2. Aplicar Migration 1: Schema Inicial

1. Abra o arquivo `supabase/migrations/001_initial_schema.sql` no seu editor
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione `Cmd+Enter` / `Ctrl+Enter`)
5. Aguarde a execução completar (deve mostrar "Success. No rows returned")

### 3. Aplicar Migration 2: Dados Iniciais

1. Abra o arquivo `supabase/migrations/002_seed_data.sql` no seu editor
2. Copie TODO o conteúdo do arquivo
3. No SQL Editor, clique em **New query** novamente
4. Cole o conteúdo
5. Clique em **Run**
6. Aguarde a execução completar

### 4. Verificar se Funcionou

Execute esta query no SQL Editor para verificar:

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

Você deve ver todas as 7 tabelas listadas.

### 5. Verificar Dados Iniciais

```sql
-- Verificar eventos
SELECT * FROM events;

-- Verificar estágios do pipeline
SELECT * FROM pipeline_stages ORDER BY position;

-- Verificar cotas de patrocínio
SELECT * FROM sponsorship_tiers;
```

## Troubleshooting

### Erro: "relation already exists"
- Algumas tabelas já existem. Você pode:
  - Deletar as tabelas existentes manualmente
  - Ou pular a criação das tabelas que já existem

### Erro: "permission denied"
- Certifique-se de estar logado no Dashboard do Supabase
- Verifique se você tem permissões de administrador no projeto

### Erro: "syntax error"
- Verifique se copiou o arquivo completo
- Certifique-se de que não há caracteres especiais corrompidos

## Próximos Passos

Após aplicar as migrations:

1. ✅ Verificar se todas as tabelas foram criadas
2. ✅ Verificar se os dados iniciais foram inseridos
3. ✅ Testar o login com o usuário de teste (`teste@utmb.com`)




