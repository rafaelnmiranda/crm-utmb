#!/usr/bin/env node

/**
 * Script para aplicar migrations via API REST do Supabase
 * Usa a API Management do Supabase para executar SQL
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Carregar variáveis de ambiente
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
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

// Extrair project_ref da URL
const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!match) {
  console.error('❌ URL do Supabase inválida!');
  process.exit(1);
}

const projectRef = match[1];

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    // Usar a API Management do Supabase
    // Nota: Isso requer autenticação via access token do Supabase
    // A forma mais simples é usar o Dashboard ou CLI
    
    console.log('⚠️  A API REST do Supabase não permite executar SQL diretamente.');
    console.log('   Use uma das opções abaixo:\n');
    console.log('1. Dashboard: https://app.supabase.com/project/' + projectRef + '/sql/new');
    console.log('2. Supabase CLI: supabase link --project-ref ' + projectRef + ' && supabase db push');
    console.log('3. Reinicie o Cursor para usar o MCP\n');
    
    reject(new Error('API REST não suporta execução direta de SQL'));
  });
}

async function main() {
  console.log('🚀 Tentando aplicar migrations via API...');
  console.log('Projeto:', projectRef);
  console.log('─'.repeat(50));
  
  const migration1Path = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
  const migration2Path = path.join(__dirname, '..', 'supabase', 'migrations', '002_seed_data.sql');
  
  if (!fs.existsSync(migration1Path) || !fs.existsSync(migration2Path)) {
    console.error('❌ Arquivos de migration não encontrados!');
    process.exit(1);
  }
  
  try {
    await executeSQL('SELECT 1');
  } catch (error) {
    console.log('\n💡 Recomendação: Use o Dashboard do Supabase para aplicar as migrations.');
    console.log('   É a forma mais rápida e confiável.\n');
  }
}

main();



