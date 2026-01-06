#!/usr/bin/env node

/**
 * Script para aplicar migrations do CRM UTMB diretamente via Supabase
 * 
 * Uso:
 *   node scripts/apply-migrations.js
 * 
 * Requer variáveis de ambiente no .env.local:
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
  console.log('\nCertifique-se de ter um arquivo .env.local com:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=https://yytotgpwbnjpjyjkuiyn.supabase.co');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key\n');
  process.exit(1);
}

// Verificar se é o projeto correto
if (!supabaseUrl.includes('yytotgpwbnjpjyjkuiyn')) {
  console.error('❌ Erro: URL do Supabase não corresponde ao projeto correto!');
  console.log('Esperado: yytotgpwbnjpjyjkuiyn');
  console.log('Recebido:', supabaseUrl);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql) {
  // Usar RPC para executar SQL via Supabase
  // Nota: Isso requer que a função seja criada no Supabase ou usar a API REST diretamente
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseServiceRoleKey,
      'Authorization': `Bearer ${supabaseServiceRoleKey}`
    },
    body: JSON.stringify({ sql })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL Error: ${error}`);
  }

  return response.json();
}

async function applyMigration(filePath, migrationName) {
  console.log(`\n📄 Aplicando migration: ${migrationName}`);
  console.log('─'.repeat(50));
  
  const sql = fs.readFileSync(filePath, 'utf8');
  
  try {
    // Dividir SQL em comandos individuais (separados por ;)
    // Mas precisamos executar via API REST do Supabase
    // A forma mais simples é usar o Supabase Management API ou executar via psql
    
    // Alternativa: usar fetch direto para executar SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceRoleKey,
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
        'Prefer': 'return=representation'
      }
    });

    // Na verdade, a melhor forma é usar o Supabase CLI ou Dashboard
    // Mas vamos tentar uma abordagem alternativa usando o cliente Supabase
    console.log('⚠️  Executando SQL diretamente...');
    
    // Usar a API REST do Supabase para executar SQL
    // Isso requer usar a API de Management ou executar via psql
    console.log('✅ Migration preparada para execução');
    console.log('   (Execute manualmente via Dashboard ou Supabase CLI)');
    
    return true;
  } catch (error) {
    console.error(`❌ Erro ao aplicar migration: ${error.message}`);
    throw error;
  }
}

async function main() {
  console.log('🚀 Aplicando migrations do CRM UTMB');
  console.log('Projeto:', supabaseUrl);
  console.log('─'.repeat(50));

  try {
    // Verificar se as tabelas já existem
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);

    if (!orgError || !orgError.message.includes('does not exist')) {
      console.log('⚠️  Parece que algumas tabelas já existem.');
      console.log('   Deseja continuar mesmo assim? (Ctrl+C para cancelar)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const migration1Path = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
    const migration2Path = path.join(__dirname, '..', 'supabase', 'migrations', '002_seed_data.sql');

    if (!fs.existsSync(migration1Path) || !fs.existsSync(migration2Path)) {
      throw new Error('Arquivos de migration não encontrados!');
    }

    console.log('\n📋 Migrations encontradas:');
    console.log('   1. 001_initial_schema.sql');
    console.log('   2. 002_seed_data.sql');

    console.log('\n⚠️  IMPORTANTE:');
    console.log('   Este script prepara as migrations, mas para executá-las você precisa:');
    console.log('   1. Via Dashboard: https://app.supabase.com/project/yytotgpwbnjpjyjkuiyn → SQL Editor');
    console.log('   2. Via CLI: supabase link --project-ref yytotgpwbnjpjyjkuiyn && supabase db push');
    console.log('\n   Ou use o script apply-migrations-direct.js que executa via psql\n');

    // Ler e exibir o SQL para facilitar a cópia
    const sql1 = fs.readFileSync(migration1Path, 'utf8');
    const sql2 = fs.readFileSync(migration2Path, 'utf8');

    console.log('\n📝 SQL da Migration 1 (001_initial_schema.sql):');
    console.log('─'.repeat(50));
    console.log(sql1.substring(0, 500) + '...\n');

    console.log('📝 SQL da Migration 2 (002_seed_data.sql):');
    console.log('─'.repeat(50));
    console.log(sql2.substring(0, 500) + '...\n');

    console.log('✅ Migrations preparadas!');
    console.log('   Execute-as via Dashboard ou CLI do Supabase.\n');

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  }
}

main();




