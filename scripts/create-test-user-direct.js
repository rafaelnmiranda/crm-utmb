#!/usr/bin/env node

/**
 * Script para criar um usuário de teste diretamente no Supabase
 * 
 * Uso:
 *   node scripts/create-test-user-direct.js
 * 
 * Requer variáveis de ambiente:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente do .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!');
  console.log('\nCertifique-se de ter um arquivo .env.local na raiz do projeto com:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role');
  console.log('\nVocê pode encontrar essas informações no Dashboard do Supabase:');
  console.log('  Settings → API → Project URL e service_role key\n');
  console.log('Alternativamente, você pode criar o usuário via Dashboard:');
  console.log('  Authentication → Users → Add User\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  const testEmail = 'teste@utmb.com';
  const testPassword = 'teste123456';
  
  console.log('Criando usuário de teste...');
  console.log(`Email: ${testEmail}`);
  console.log(`Senha: ${testPassword}\n`);
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Usuário Teste',
      }
    });
    
    if (error) {
      // Se o usuário já existe, informar
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.log('⚠️  Usuário já existe!');
        console.log('\nCredenciais de acesso:');
        console.log(`  Email: ${testEmail}`);
        console.log(`  Senha: ${testPassword}\n`);
        return;
      }
      console.error('❌ Erro ao criar usuário:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Usuário criado com sucesso!\n');
    console.log('Credenciais de acesso:');
    console.log(`  Email: ${testEmail}`);
    console.log(`  Senha: ${testPassword}\n`);
    console.log('Você pode usar essas credenciais para fazer login no sistema.\n');
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    process.exit(1);
  }
}

createTestUser();

