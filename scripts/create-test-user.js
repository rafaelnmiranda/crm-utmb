#!/usr/bin/env node

/**
 * Script para criar um usuário de teste no sistema UTMB CRM
 * 
 * Uso:
 *   node scripts/create-test-user.js
 * 
 * Ou se o servidor estiver rodando:
 *   curl -X POST http://localhost:3000/api/admin/create-test-user
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/create-test-user',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.success) {
        console.log('\n✅ Usuário de teste criado com sucesso!\n');
        console.log('Credenciais de acesso:');
        console.log(`  Email: ${response.credentials.email}`);
        console.log(`  Senha: ${response.credentials.password}`);
        console.log('\nVocê pode usar essas credenciais para fazer login no sistema.\n');
      } else {
        console.error('❌ Erro:', response.error);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error.message);
      console.log('Resposta recebida:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro ao conectar ao servidor:', error.message);
  console.log('\nCertifique-se de que o servidor Next.js está rodando:');
  console.log('  npm run dev\n');
  process.exit(1);
});

req.end();




