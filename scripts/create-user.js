#!/usr/bin/env node

/**
 * Script simplificado para criar usuário de teste
 * 
 * Execute após configurar as variáveis de ambiente no .env.local
 */

const https = require('https');

// Você precisa configurar essas variáveis no seu .env.local
// ou passá-las como variáveis de ambiente
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.argv[2];
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.argv[3];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.log(`
📝 Como usar este script:

1. Configure as variáveis de ambiente:
   export NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"

2. Execute:
   node scripts/create-user.js

OU passe como argumentos:
   node scripts/create-user.js "https://seu-projeto.supabase.co" "sua-service-role-key"

📚 Veja CRIAR_USUARIO_TESTE.md para mais opções.
  `);
  process.exit(1);
}

const testEmail = 'teste@utmb.com';
const testPassword = 'teste123456';

const url = new URL(`${SUPABASE_URL}/auth/v1/admin/users`);
const postData = JSON.stringify({
  email: testEmail,
  password: testPassword,
  email_confirm: true,
  user_metadata: {
    name: 'Usuário Teste'
  }
});

const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length,
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
  }
};

console.log('Criando usuário de teste...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      const response = JSON.parse(data);
      console.log('✅ Usuário criado com sucesso!\n');
      console.log('📧 Credenciais de acesso:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Senha: ${testPassword}\n`);
      console.log('Você pode fazer login em: http://localhost:3000/login\n');
    } else {
      try {
        const error = JSON.parse(data);
        if (error.message && error.message.includes('already')) {
          console.log('⚠️  Usuário já existe!\n');
          console.log('📧 Use essas credenciais para fazer login:');
          console.log(`   Email: ${testEmail}`);
          console.log(`   Senha: ${testPassword}\n`);
        } else {
          console.error('❌ Erro:', error.message || error.error_description || data);
        }
      } catch (e) {
        console.error('❌ Erro ao criar usuário. Status:', res.statusCode);
        console.error('Resposta:', data);
      }
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro de conexão:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();




