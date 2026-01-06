# Scripts SQL de Manutenção

Esta pasta contém scripts SQL para manutenção, correção e consultas do banco de dados.

## Scripts de Limpeza

- **LIMPAR_DUPLICATAS.sql** - Remove entregáveis duplicados (versão original)
- **LIMPAR_DUPLICATAS_SEGURO.sql** - Remove duplicatas de forma mais segura (versão melhorada)
- **LIMPAR_DUPLICATAS_V2.sql** - Versão 2 do script de limpeza de duplicatas

## Scripts de Correção

- **FIX_RLS_ONLY.sql** - Corrige Row Level Security
- **FIX_SPONSORSHIP_TIER_COUNTERPARTS.sql** - Corrige problemas em sponsorship_tier_counterparts
- **CHECK_AND_FIX_DATA.sql** - Verifica e corrige dados

## Scripts de Atualização

- **ADICIONAR_ENTREGAVEIS_SUPPLIER.sql** - Adiciona entregáveis para supplier
- **POPULATE_SPONSORSHIP_TIER_COUNTERPARTS.sql** - Popula dados em sponsorship_tier_counterparts
- **UPDATE_DESCRICOES_ENTREGAVEIS.sql** - Atualiza descrições de entregáveis
- **empresas_setores_migration.sql** - Migração de empresas e setores

## Scripts de Consulta/Verificação

- **QUERY_ENTREGAVEIS_POR_COTA.sql** - Consulta entregáveis por cota
- **VER_ENTREGAVEIS_POR_COTA.sql** - Visualiza entregáveis por cota
- **VERIFICAR_COTAS_SUPPLIER.sql** - Verifica cotas de supplier
- **VERIFICAR_DUPLICATAS.sql** - Verifica duplicatas antes de remover
- **VERIFICAR_RESULTADO_FINAL.sql** - Verifica resultado final após operações

## ⚠️ Atenção

- Sempre execute scripts de verificação antes de scripts de modificação
- Faça backup do banco de dados antes de executar scripts de limpeza ou correção
- Teste em ambiente de desenvolvimento antes de usar em produção

## Uso

Execute os scripts via:
1. **Supabase Dashboard** - SQL Editor
2. **Supabase CLI** - `supabase db execute < script.sql`
3. **psql** - `psql <connection_string> < script.sql`
