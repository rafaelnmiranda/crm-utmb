# Como Criar um Usuário de Teste

Este guia explica como criar um usuário de teste para o sistema UTMB CRM.

## Método 1: Via API Route (Recomendado)

### Pré-requisitos

1. Certifique-se de que você tem um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Em outro terminal, execute:

```bash
curl -X POST http://localhost:3000/api/admin/create-test-user
```

Ou acesse diretamente no navegador (mas isso não funcionará com POST, então use curl ou um cliente HTTP).

### Credenciais do Usuário de Teste

Após a criação bem-sucedida, você receberá:

- **Email**: `teste@utmb.com`
- **Senha**: `teste123456`

## Método 2: Via Script Node.js Direto

Execute o script diretamente (requer variáveis de ambiente configuradas):

```bash
node scripts/create-test-user-direct.js
```

## Método 3: Via Dashboard do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Navegue até **Authentication** → **Users**
3. Clique em **Add User** → **Create new user**
4. Preencha:
   - **Email**: `teste@utmb.com`
   - **Password**: `teste123456`
   - Marque **Auto Confirm User**
5. Clique em **Create User**

## Método 4: Via Supabase CLI

Se você tem o Supabase CLI instalado:

```bash
supabase auth users create teste@utmb.com --password teste123456 --email-confirm
```

## Verificação

Após criar o usuário, você pode fazer login na aplicação usando:

- URL: `http://localhost:3000/login`
- Email: `teste@utmb.com`
- Senha: `teste123456`

## Notas Importantes

- A service_role key é necessária para criar usuários programaticamente
- Mantenha a service_role key segura e nunca a exponha no frontend
- O usuário de teste será criado com email confirmado automaticamente
- Se o usuário já existir, você receberá uma mensagem de erro




