#!/usr/bin/env node

/**
 * Script para aplicar migrations via psql (requer psql instalado)
 * 
 * Uso:
 *   node scripts/apply-migrations-direct.js
 * 
 * Requer:
 *   - psql instalado
 *   - Variáveis de ambiente no .env.local
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

if (!supabaseUrl) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL não encontrado!');
  process.exit(1);
}

// Extrair informações da URL
const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!match) {
  console.error('❌ URL do Supabase inválida!');
  process.exit(1);
}

const projectRef = match[1];
const dbHost = `db.${projectRef}.supabase.co`;
const dbPort = 5432;
const dbName = 'postgres';
const dbUser = 'postgres';

console.log('🚀 Aplicando migrations via psql');
console.log('─'.repeat(50));
console.log(`Projeto: ${projectRef}`);
console.log(`Host: ${dbHost}`);
console.log('─'.repeat(50));

// Verificar se psql está instalado
try {
  execSync('which psql', { stdio: 'ignore' });
} catch (error) {
  console.error('❌ psql não está instalado!');
  console.log('\nInstale o PostgreSQL client:');
  console.log('  macOS: brew install postgresql');
  console.log('  Ubuntu: sudo apt-get install postgresql-client');
  console.log('\nOu use o Dashboard do Supabase para aplicar as migrations.\n');
  process.exit(1);
}

console.log('\n⚠️  ATENÇÃO:');
console.log('   Este script requer a senha do banco de dados.');
console.log('   Você pode encontrá-la em:');
console.log('   https://app.supabase.com/project/' + projectRef + '/settings/database');
console.log('\n   Ou use o método mais simples via Dashboard:\n');
console.log('   1. Acesse: https://app.supabase.com/project/' + projectRef + '/sql/new');
console.log('   2. Cole o conteúdo de supabase/migrations/001_initial_schema.sql');
console.log('   3. Execute');
console.log('   4. Repita com 002_seed_data.sql\n');

const migration1Path = path.join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql');
const migration2Path = path.join(__dirname, '..', 'supabase', 'migrations', '002_seed_data.sql');

if (!fs.existsSync(migration1Path) || !fs.existsSync(migration2Path)) {
  console.error('❌ Arquivos de migration não encontrados!');
  process.exit(1);
}

console.log('📋 Migrations encontradas:');
console.log('   ✓ 001_initial_schema.sql');
console.log('   ✓ 002_seed_data.sql\n');

console.log('💡 Dica: Use o Dashboard do Supabase para aplicar as migrations de forma mais simples!\n');




