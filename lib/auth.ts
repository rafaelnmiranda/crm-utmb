import { createServerClient } from './supabase/server'
import { redirect } from 'next/navigation'

export async function getSession() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

/**
 * Verifica se o usuário atual é um administrador
 * Baseado na lista de emails admin definida em ADMIN_EMAILS
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  
  if (!user?.email) {
    return false
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
  return adminEmails.includes(user.email.toLowerCase())
}

/**
 * Requer que o usuário seja um administrador
 * Redireciona para /login se não estiver autenticado
 * Retorna erro se não for admin
 */
export async function requireAdmin() {
  const session = await requireAuth()
  const admin = await isAdmin()
  
  if (!admin) {
    throw new Error('Acesso negado. Apenas administradores podem realizar esta ação.')
  }
  
  return session
}




