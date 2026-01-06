# Guia de Integrações - UTMB CRM

Este documento detalha todas as integrações necessárias para o CRM UTMB, incluindo configuração passo a passo.

## Índice

1. [Supabase](#1-supabase)
2. [Vercel](#2-vercel)
3. [Microsoft Graph API (Calendar e Email)](#3-microsoft-graph-api-calendar-e-email)
4. [OpenAI/Anthropic (Geração de Mensagens com IA)](#4-openaianthropic-geração-de-mensagens-com-ia)
5. [Variáveis de Ambiente](#5-variáveis-de-ambiente)

---

## 1. Supabase

### 1.1. Configuração Inicial

**Projeto**: UTMB CRM  
**Project ID**: `yytotgpwbnjpjyjkuiyn`

#### Passos:

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Navegue até **Settings** → **API**
3. Anote as seguintes informações:
   - **Project URL**: `https://yytotgpwbnjpjyjkuiyn.supabase.co`
   - **anon/public key**: (chave pública para uso no frontend)
   - **service_role key**: (chave privada para uso no backend - manter segredo)

### 1.2. Database (PostgreSQL)

#### Schema Principal

Execute as migrations na ordem:

1. **001_initial_schema.sql** - Tabelas principais
2. **002_seed_data.sql** - Dados iniciais (eventos, estágios, cotas)

#### Acesso ao Database

- **Host**: `db.yytotgpwbnjpjyjkuiyn.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: (gerada automaticamente, disponível em Settings → Database)

#### Migrations

As migrations devem ser executadas via:
- Supabase Dashboard → SQL Editor
- Ou via CLI do Supabase (recomendado para produção)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref yytotgpwbnjpjyjkuiyn

# Aplicar migrations
supabase db push
```

### 1.3. Authentication

#### Configuração

1. Acesse **Authentication** → **Settings**
2. Configure:
   - **Site URL**: `https://utmb-crm.vercel.app` (ou seu domínio)
   - **Redirect URLs**: Adicione URLs permitidas para redirect após login

#### Providers

Para MVP inicial, usar apenas **Email**:
- Habilitar **Email** provider
- Configurar templates de email (opcional)

#### Row Level Security (RLS)

Políticas básicas necessárias:

```sql
-- Permitir leitura/escrita apenas para usuários autenticados
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;

-- Política básica: usuário autenticado pode fazer tudo
CREATE POLICY "Users can manage their own data"
ON organizations FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own data"
ON deals FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own data"
ON contacts FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own data"
ON activities FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage their own data"
ON deal_documents FOR ALL
USING (auth.uid() IS NOT NULL);
```

### 1.4. Storage

#### Bucket para Documentos

1. Acesse **Storage** → **Buckets**
2. Criar novo bucket:
   - **Name**: `deal-documents`
   - **Public**: `false` (privado)
   - **File size limit**: 10MB (ou conforme necessidade)
   - **Allowed MIME types**: `application/pdf, image/*, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

#### Políticas de Storage

```sql
-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deal-documents');

-- Permitir leitura apenas para usuários autenticados
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'deal-documents');

-- Permitir delete apenas para usuários autenticados
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'deal-documents');
```

#### Estrutura de Pastas

```
deal-documents/
  └── {deal_id}/
      └── {filename}
```

Exemplo: `deal-documents/123e4567-e89b-12d3-a456-426614174000/contrato.pdf`

---

## 2. Vercel

### 2.1. Configuração Inicial

#### Passos:

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Conecte seu repositório GitHub/GitLab/Bitbucket
3. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `.` (raiz do projeto)
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)

### 2.2. Variáveis de Ambiente

Configure todas as variáveis de ambiente no Vercel:

**Settings** → **Environment Variables**

Veja seção [5. Variáveis de Ambiente](#5-variáveis-de-ambiente) para lista completa.

### 2.3. Integração com Supabase

O Vercel se conecta automaticamente ao Supabase através das variáveis de ambiente. Não é necessária configuração adicional.

### 2.4. Domínio Customizado (Opcional)

1. **Settings** → **Domains**
2. Adicionar domínio customizado (ex: `crm.utmb.world`)
3. Configurar DNS conforme instruções do Vercel

### 2.5. Deploy

O deploy é automático a cada push para a branch `main` (ou branch configurada).

Para deploy manual:
```bash
vercel --prod
```

---

## 3. Microsoft Graph API (Calendar e Email)

### 3.1. Registro da Aplicação no Azure

#### Passos:

1. Acesse [Azure Portal](https://portal.azure.com)
2. Vá para **Azure Active Directory** → **App registrations**
3. Clique em **New registration**
4. Preencha:
   - **Name**: `UTMB CRM`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: 
     - Type: `Web`
     - URL: `https://utmb-crm.vercel.app/api/auth/microsoft/callback`
5. Clique em **Register**

### 3.2. Configuração de Permissões

#### API Permissions

1. Na aplicação criada, vá para **API permissions**
2. Clique em **Add a permission**
3. Selecione **Microsoft Graph**
4. Adicione as seguintes **Delegated permissions**:

**Calendar:**
- `Calendars.ReadWrite` - Ler e escrever calendários
- `Calendars.ReadWrite.Shared` - Ler e escrever calendários compartilhados

**Mail:**
- `Mail.ReadWrite` - Ler e escrever emails
- `Mail.Send` - Enviar emails

**User:**
- `User.Read` - Ler perfil do usuário

5. Clique em **Add permissions**

#### Consentimento Admin

1. Clique em **Grant admin consent for [sua organização]**
2. Confirme o consentimento

### 3.3. Credenciais (Client Secret)

1. Vá para **Certificates & secrets**
2. Clique em **New client secret**
3. Preencha:
   - **Description**: `UTMB CRM Production`
   - **Expires**: Escolha período (recomendado: 24 meses)
4. Clique em **Add**
5. **IMPORTANTE**: Copie o **Value** imediatamente (não será exibido novamente)
6. Anote o **Secret ID**

### 3.4. Application (Client) ID

1. Na página **Overview** da aplicação
2. Copie o **Application (client) ID**
3. Anote o **Directory (tenant) ID**

### 3.5. Configuração no Código

#### OAuth 2.0 Flow

O fluxo de autenticação será:

1. Usuário clica em "Conectar Microsoft Calendar"
2. Redireciona para Microsoft Login
3. Usuário autoriza acesso
4. Microsoft redireciona de volta com código
5. Trocar código por access token e refresh token
6. Armazenar tokens de forma segura (criptografados no banco)

#### Estrutura de Tabela para Tokens

```sql
CREATE TABLE microsoft_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL, -- Criptografado
  refresh_token TEXT NOT NULL, -- Criptografado
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice único por usuário
CREATE UNIQUE INDEX idx_microsoft_tokens_user_id ON microsoft_tokens(user_id);
```

#### Rotas de API Necessárias

```
/api/auth/microsoft/login
/api/auth/microsoft/callback
/api/auth/microsoft/refresh
/api/calendar/sync
/api/calendar/events
```

### 3.6. Email Corporativo

**Email**: `rafael.miranda@utmb.world`

Este email será usado para:
- Autenticação OAuth
- Envio de emails através do Microsoft Graph API
- Sincronização de calendário

---

## 4. OpenAI/Anthropic (Geração de Mensagens com IA)

### 4.1. Escolha do Provedor

**Recomendação**: OpenAI (GPT-4 ou GPT-3.5-turbo) para MVP

**Alternativa**: Anthropic Claude (se preferir)

### 4.2. OpenAI Setup

#### Passos:

1. Acesse [OpenAI Platform](https://platform.openai.com)
2. Crie uma conta ou faça login
3. Vá para **API Keys**
4. Clique em **Create new secret key**
5. Nomeie: `UTMB CRM Production`
6. **IMPORTANTE**: Copie a chave imediatamente (não será exibida novamente)

#### Modelo Recomendado

- **GPT-3.5-turbo**: Mais econômico, suficiente para MVP
- **GPT-4**: Melhor qualidade, mais caro

### 4.3. Anthropic Setup (Alternativa)

#### Passos:

1. Acesse [Anthropic Console](https://console.anthropic.com)
2. Crie uma conta ou faça login
3. Vá para **API Keys**
4. Clique em **Create Key**
5. Nomeie: `UTMB CRM Production`
6. Copie a chave

#### Modelo Recomendado

- **Claude 3 Sonnet**: Boa relação custo/qualidade
- **Claude 3 Opus**: Melhor qualidade, mais caro

### 4.4. Configuração no Código

#### Endpoint da API

**OpenAI:**
```
POST https://api.openai.com/v1/chat/completions
```

**Anthropic:**
```
POST https://api.anthropic.com/v1/messages
```

#### Rate Limits

- **OpenAI**: Depende do plano (Free tier: 3 RPM, Paid: muito maior)
- **Anthropic**: Depende do plano

### 4.5. Custos Estimados

**OpenAI GPT-3.5-turbo:**
- Input: $0.50 / 1M tokens
- Output: $1.50 / 1M tokens
- Estimativa: ~$5-10/mês para MVP

**Anthropic Claude 3 Sonnet:**
- Input: $3.00 / 1M tokens
- Output: $15.00 / 1M tokens
- Estimativa: ~$20-30/mês para MVP

---

## 5. Variáveis de Ambiente

### 5.1. Arquivo `.env.local` (Desenvolvimento)

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yytotgpwbnjpjyjkuiyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Microsoft Graph API
MICROSOFT_CLIENT_ID=seu_client_id_aqui
MICROSOFT_CLIENT_SECRET=seu_client_secret_aqui
MICROSOFT_TENANT_ID=seu_tenant_id_aqui
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/microsoft/callback

# OpenAI (ou Anthropic)
OPENAI_API_KEY=sua_openai_api_key_aqui
# OU
ANTHROPIC_API_KEY=sua_anthropic_api_key_aqui

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5.2. Variáveis no Vercel

Configure todas as variáveis acima no Vercel:

1. **Settings** → **Environment Variables**
2. Adicione cada variável
3. Selecione os ambientes (Production, Preview, Development)
4. **IMPORTANTE**: Para produção, use URLs de produção:

```env
MICROSOFT_REDIRECT_URI=https://utmb-crm.vercel.app/api/auth/microsoft/callback
NEXT_PUBLIC_APP_URL=https://utmb-crm.vercel.app
```

### 5.3. Variáveis Sensíveis

**NUNCA** commite no Git:
- `SUPABASE_SERVICE_ROLE_KEY`
- `MICROSOFT_CLIENT_SECRET`
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`

Adicione ao `.gitignore`:
```
.env.local
.env*.local
```

---

## 6. Checklist de Integração

### Fase 1: Setup Básico
- [ ] Criar projeto no Supabase
- [ ] Configurar Database (executar migrations)
- [ ] Configurar Authentication
- [ ] Criar bucket de Storage
- [ ] Configurar políticas RLS

### Fase 2: Deploy
- [ ] Conectar repositório ao Vercel
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Fazer primeiro deploy
- [ ] Testar autenticação

### Fase 3: Microsoft Graph
- [ ] Registrar aplicação no Azure
- [ ] Configurar permissões (Calendar e Mail)
- [ ] Obter Client ID e Client Secret
- [ ] Implementar OAuth flow
- [ ] Testar sincronização de calendário
- [ ] Testar envio de emails

### Fase 4: IA
- [ ] Criar conta OpenAI/Anthropic
- [ ] Obter API Key
- [ ] Implementar geração de mensagens
- [ ] Testar templates de mensagens

### Fase 5: Testes Finais
- [ ] Testar upload de documentos
- [ ] Testar todas as integrações em produção
- [ ] Verificar logs de erro
- [ ] Monitorar uso de APIs

---

## 7. Recursos e Documentação

### Supabase
- [Documentação](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Storage Guide](https://supabase.com/docs/guides/storage)

### Vercel
- [Documentação](https://vercel.com/docs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)

### Microsoft Graph API
- [Documentação](https://docs.microsoft.com/graph/)
- [Calendar API](https://docs.microsoft.com/graph/api/resources/calendar)
- [Mail API](https://docs.microsoft.com/graph/api/resources/mail-api-overview)
- [OAuth 2.0](https://docs.microsoft.com/azure/active-directory/develop/v2-oauth2-auth-code-flow)

### OpenAI
- [Documentação](https://platform.openai.com/docs)
- [API Reference](https://platform.openai.com/docs/api-reference)
- [Pricing](https://openai.com/pricing)

### Anthropic
- [Documentação](https://docs.anthropic.com)
- [API Reference](https://docs.anthropic.com/claude/reference)
- [Pricing](https://www.anthropic.com/pricing)

---

## 8. Troubleshooting

### Problemas Comuns

#### Supabase Connection Error
- Verificar variáveis de ambiente
- Verificar se o projeto está ativo
- Verificar políticas RLS

#### Microsoft OAuth Error
- Verificar redirect URI está correto
- Verificar permissões foram concedidas
- Verificar Client ID e Secret estão corretos

#### Storage Upload Error
- Verificar políticas de Storage
- Verificar tamanho do arquivo
- Verificar MIME type permitido

#### Vercel Build Error
- Verificar variáveis de ambiente
- Verificar logs de build
- Verificar dependências no package.json

---

## 9. Segurança

### Boas Práticas

1. **Nunca exponha chaves privadas no frontend**
2. **Use variáveis de ambiente para todos os secrets**
3. **Implemente rate limiting nas APIs**
4. **Criptografe tokens do Microsoft no banco**
5. **Use HTTPS sempre (Vercel faz isso automaticamente)**
6. **Implemente validação de entrada em todas as APIs**
7. **Use RLS no Supabase para segurança de dados**

### Rotação de Secrets

- **Microsoft Client Secret**: Rotacionar a cada 6-12 meses
- **OpenAI/Anthropic API Key**: Rotacionar se comprometida
- **Supabase Service Role Key**: Rotacionar se comprometida

---

**Última atualização**: 2025-01-XX  
**Versão**: 1.0




