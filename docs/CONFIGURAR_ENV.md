# Guia Completo: Como Configurar o Arquivo .env.local

Este guia explica em detalhes como criar e configurar o arquivo `.env.local` para o projeto UTMB CRM.

## 📋 Índice

1. [O que é o arquivo .env.local?](#o-que-é-o-arquivo-envlocal)
2. [Como Criar o Arquivo](#como-criar-o-arquivo)
3. [Variáveis Obrigatórias](#variáveis-obrigatórias)
4. [Como Obter Cada Variável](#como-obter-cada-variável)
5. [Exemplo Completo](#exemplo-completo)
6. [Validação e Testes](#validação-e-testes)
7. [Troubleshooting](#troubleshooting)

---

## O que é o arquivo .env.local?

O arquivo `.env.local` é um arquivo de configuração local que armazena variáveis de ambiente sensíveis do projeto. Este arquivo:

- ✅ **NÃO** deve ser commitado no Git (já está no `.gitignore`)
- ✅ É carregado automaticamente pelo Next.js
- ✅ Contém informações sensíveis como chaves de API e secrets
- ✅ Permite diferentes configurações para desenvolvimento e produção

**IMPORTANTE**: Nunca compartilhe o conteúdo deste arquivo publicamente ou o commite no repositório Git.

---

## Como Criar o Arquivo

### Passo 1: Navegue até a Raiz do Projeto

Abra o terminal e navegue até a pasta raiz do projeto:

```bash
cd /caminho/para/utmb-crm
```

Ou se você já está no diretório do projeto, confirme que está na raiz executando:

```bash
pwd
# Deve mostrar: /Users/RafaelMiranda/utmb-crm (ou caminho equivalente)
```

### Passo 2: Crie o Arquivo .env.local

Você pode criar o arquivo de duas formas:

#### Opção A: Via Terminal (Recomendado)

```bash
touch .env.local
```

#### Opção B: Via Editor de Código

1. No VS Code (ou seu editor), clique em "New File"
2. Digite `.env.local` como nome do arquivo
3. Salve na raiz do projeto (mesmo nível que `package.json`)

### Passo 3: Verifique a Estrutura

O arquivo deve estar na raiz do projeto, junto com:
- `package.json`
- `next.config.js`
- `README.md`
- `tsconfig.json`

---

## Variáveis Obrigatórias

O projeto UTMB CRM requer as seguintes variáveis de ambiente:

### 🔴 Obrigatórias (Sem elas o app não funciona)

1. **NEXT_PUBLIC_SUPABASE_URL** - URL do projeto Supabase
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** - Chave pública/anônima do Supabase
3. **SUPABASE_SERVICE_ROLE_KEY** - Chave de serviço do Supabase (sensível)

### 🟡 Opcionais mas Recomendadas

4. **MICROSOFT_CLIENT_ID** - ID da aplicação Microsoft Azure
5. **MICROSOFT_CLIENT_SECRET** - Secret da aplicação Microsoft (sensível)
6. **MICROSOFT_TENANT_ID** - ID do tenant Microsoft Azure
7. **MICROSOFT_REDIRECT_URI** - URI de callback do OAuth Microsoft
8. **OPENAI_API_KEY** ou **ANTHROPIC_API_KEY** - Chave da API de IA (sensível)
9. **NEXT_PUBLIC_APP_URL** - URL da aplicação
10. **ADMIN_EMAILS** - Lista de emails de administradores (separados por vírgula)

---

## Como Obter Cada Variável

### 1. Variáveis do Supabase

#### NEXT_PUBLIC_SUPABASE_URL

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto (UTMB CRM - Project ID: `yytotgpwbnjpjyjkuiyn`)
3. Vá em **Settings** → **API**
4. Copie o valor de **Project URL**
   - Formato: `https://yytotgpwbnjpjyjkuiyn.supabase.co`

#### NEXT_PUBLIC_SUPABASE_ANON_KEY

1. Na mesma página (Settings → API)
2. Copie o valor de **anon/public key**
   - É uma string longa começando com `eyJ...`
   - Esta chave é segura para usar no frontend

#### SUPABASE_SERVICE_ROLE_KEY

1. Na mesma página (Settings → API)
2. Role até a seção **Project API keys**
3. Copie o valor de **service_role key**
   - ⚠️ **ATENÇÃO**: Esta chave tem acesso completo ao banco
   - ⚠️ **NUNCA** exponha no frontend
   - ⚠️ Mantenha em segredo absoluto

---

### 2. Variáveis do Microsoft Azure

#### MICROSOFT_CLIENT_ID

1. Acesse [Azure Portal](https://portal.azure.com)
2. Vá para **Azure Active Directory** → **App registrations**
3. Selecione a aplicação "UTMB CRM"
4. Na página **Overview**, copie o **Application (client) ID**

#### MICROSOFT_TENANT_ID

1. Na mesma página (Overview da aplicação)
2. Copie o **Directory (tenant) ID**

#### MICROSOFT_CLIENT_SECRET

1. Na aplicação, vá para **Certificates & secrets**
2. Na seção **Client secrets**, encontre o secret ativo
3. Clique em **Copy** ao lado do **Value**
   - ⚠️ Se você não vê o valor, significa que ele foi criado e você precisa criar um novo
   - ⚠️ Se criou um novo, copie imediatamente (só aparece uma vez)

#### MICROSOFT_REDIRECT_URI

Para desenvolvimento local, use:
```
http://localhost:3000/api/auth/microsoft/callback
```

Para produção, use:
```
https://utmb-crm.vercel.app/api/auth/microsoft/callback
```

---

### 3. Variáveis de IA (OpenAI ou Anthropic)

#### OPENAI_API_KEY (Recomendado)

1. Acesse [OpenAI Platform](https://platform.openai.com)
2. Faça login na sua conta
3. Vá em **API Keys** (menu lateral)
4. Clique em **Create new secret key**
5. Dê um nome (ex: "UTMB CRM Production")
6. **Copie a chave imediatamente** (só aparece uma vez)
   - Formato: `sk-...`

**OU**

#### ANTHROPIC_API_KEY (Alternativa)

1. Acesse [Anthropic Console](https://console.anthropic.com)
2. Faça login na sua conta
3. Vá em **API Keys**
4. Clique em **Create Key**
5. Dê um nome (ex: "UTMB CRM Production")
6. Copie a chave

**Nota**: Use apenas uma das duas opções (OPENAI_API_KEY ou ANTHROPIC_API_KEY), não ambas.

---

### 4. Outras Variáveis

#### NEXT_PUBLIC_APP_URL

Para desenvolvimento local:
```
http://localhost:3000
```

Para produção:
```
https://utmb-crm.vercel.app
```

#### ADMIN_EMAILS

Lista de emails de administradores separados por vírgula:
```
rafael.miranda@utmb.world,outro.admin@utmb.world
```

Ou apenas um email:
```
rafael.miranda@utmb.world
```

---

## Exemplo Completo

Aqui está um exemplo completo do arquivo `.env.local` para desenvolvimento:

```env
# ============================================
# SUPABASE - Obrigatório
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://yytotgpwbnjpjyjkuiyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# ============================================
# MICROSOFT GRAPH API - Opcional
# ============================================
MICROSOFT_CLIENT_ID=seu_client_id_aqui
MICROSOFT_CLIENT_SECRET=seu_client_secret_aqui
MICROSOFT_TENANT_ID=seu_tenant_id_aqui
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/microsoft/callback

# ============================================
# IA (OpenAI ou Anthropic) - Opcional
# ============================================
OPENAI_API_KEY=sk-sua_openai_api_key_aqui
# OU use Anthropic (comente OPENAI_API_KEY se usar esta):
# ANTHROPIC_API_KEY=sua_anthropic_api_key_aqui

# ============================================
# APP CONFIG - Recomendado
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=rafael.miranda@utmb.world
```

---

## Validação e Testes

### Passo 1: Verificar se o Arquivo foi Criado

```bash
# No terminal, na raiz do projeto
ls -la | grep .env.local
```

Deve mostrar o arquivo `.env.local`

### Passo 2: Verificar Conteúdo (Opcional)

```bash
# CUIDADO: Isso mostra o conteúdo, incluindo secrets
cat .env.local
```

**Nota**: Em produção ou em máquinas compartilhadas, evite usar `cat` para não expor os secrets no terminal.

### Passo 3: Testar se o Next.js Carrega as Variáveis

1. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

2. O Next.js carregará automaticamente o `.env.local`
3. Verifique o console por erros de variáveis faltantes

### Passo 4: Validar Variáveis no Código

Você pode verificar se as variáveis estão sendo carregadas criando uma rota de teste temporária (apenas para desenvolvimento):

```typescript
// app/api/test-env/route.ts (temporário, deletar depois)
export async function GET() {
  return Response.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    // NÃO retorne os valores reais, apenas confirme que existem
  })
}
```

Acesse: `http://localhost:3000/api/test-env`

**⚠️ LEMBRE-SE**: Delete esta rota depois de testar!

---

## Troubleshooting

### Problema: "Variável de ambiente não encontrada"

**Sintoma**: Erro no console dizendo que uma variável não está definida.

**Solução**:
1. Verifique se o arquivo está na raiz do projeto (não em subpastas)
2. Verifique se o nome da variável está exatamente correto (case-sensitive)
3. Reinicie o servidor Next.js (`Ctrl+C` e `npm run dev` novamente)
4. Verifique se não há espaços antes ou depois do `=` no arquivo `.env.local`

### Problema: Arquivo não está sendo carregado

**Sintoma**: O Next.js não carrega as variáveis do `.env.local`.

**Solução**:
1. Certifique-se de que o arquivo se chama exatamente `.env.local` (com o ponto no início)
2. Verifique se está na raiz do projeto
3. Reinicie o servidor Next.js completamente

### Problema: Variáveis NEXT_PUBLIC_* não aparecem no frontend

**Sintoma**: Variáveis que começam com `NEXT_PUBLIC_` não estão disponíveis no cliente.

**Solução**:
1. Variáveis `NEXT_PUBLIC_*` são expostas ao frontend, mas só são carregadas no build
2. Faça um rebuild completo: `npm run build` e depois `npm run dev`
3. Ou simplesmente reinicie o servidor

### Problema: "Invalid API Key" ou erros de autenticação

**Sintoma**: Erros ao conectar com Supabase, Microsoft ou OpenAI.

**Solução**:
1. Verifique se copiou as chaves completas (sem cortes)
2. Verifique se não há espaços extras antes/depois das chaves
3. Para Supabase, confirme que as chaves estão corretas no dashboard
4. Para Microsoft, verifique se o Client Secret não expirou
5. Para OpenAI/Anthropic, verifique se a API key está ativa

### Problema: Arquivo aparece no Git

**Sintoma**: O arquivo `.env.local` aparece no `git status`.

**Solução**:
1. Verifique o `.gitignore` - deve conter `.env*.local`
2. Se o arquivo já foi commitado antes, remova do Git (mas mantenha localmente):
   ```bash
   git rm --cached .env.local
   git commit -m "Remove .env.local from git"
   ```

---

## Checklist Final

Antes de começar a desenvolver, certifique-se de que:

- [ ] Arquivo `.env.local` criado na raiz do projeto
- [ ] Todas as variáveis obrigatórias do Supabase configuradas
- [ ] Variáveis do Microsoft Azure configuradas (se usar integração Microsoft)
- [ ] API Key da OpenAI ou Anthropic configurada (se usar IA)
- [ ] `NEXT_PUBLIC_APP_URL` configurado corretamente
- [ ] `ADMIN_EMAILS` configurado com seus emails
- [ ] Arquivo não aparece no `git status` (está sendo ignorado)
- [ ] Servidor Next.js inicia sem erros
- [ ] Consegue fazer login na aplicação

---

## Próximos Passos

Após configurar o `.env.local`:

1. **Aplicar Migrations**: Veja [`docs/APLICAR_MIGRATIONS.md`](APLICAR_MIGRATIONS.md)
2. **Criar Usuário de Teste**: Veja [`docs/CRIAR_USUARIO_TESTE.md`](CRIAR_USUARIO_TESTE.md)
3. **Configurar Vercel (Produção)**: Veja [`docs/INTEGRACOES.md`](INTEGRACOES.md) seção 5.2

---

## Segurança

**⚠️ IMPORTANTE - Boas Práticas de Segurança:**

1. ✅ **NUNCA** commite o arquivo `.env.local` no Git
2. ✅ **NUNCA** compartilhe as chaves publicamente
3. ✅ **NUNCA** envie as chaves por email ou chat não criptografado
4. ✅ Use diferentes chaves para desenvolvimento e produção
5. ✅ Rotacione as chaves periodicamente (especialmente Client Secrets)
6. ✅ Use um gerenciador de secrets (1Password, LastPass, etc.) para backup seguro
7. ✅ Revogue chaves antigas quando não precisar mais delas

---

## Suporte

Se tiver problemas, consulte:

- [`docs/INTEGRACOES.md`](INTEGRACOES.md) - Documentação completa de integrações
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Documentation](https://supabase.com/docs)
