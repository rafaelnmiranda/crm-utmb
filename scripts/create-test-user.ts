import { createAdminClient } from '../lib/supabase/server'

async function createTestUser() {
  const supabase = createAdminClient()
  
  const testEmail = 'teste@utmb.com'
  const testPassword = 'teste123456'
  
  console.log('Criando usuário de teste...')
  console.log(`Email: ${testEmail}`)
  console.log(`Senha: ${testPassword}`)
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Confirma o email automaticamente
      user_metadata: {
        name: 'Usuário Teste',
      }
    })
    
    if (error) {
      console.error('Erro ao criar usuário:', error.message)
      process.exit(1)
    }
    
    console.log('✅ Usuário criado com sucesso!')
    console.log(`ID: ${data.user.id}`)
    console.log(`Email: ${data.user.email}`)
    console.log('\nVocê pode fazer login com:')
    console.log(`Email: ${testEmail}`)
    console.log(`Senha: ${testPassword}`)
  } catch (error: any) {
    console.error('Erro inesperado:', error.message)
    process.exit(1)
  }
}

createTestUser()




