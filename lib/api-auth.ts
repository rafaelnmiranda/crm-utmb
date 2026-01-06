import { createServerClient } from './supabase/server'
import { NextResponse } from 'next/server'

/**
 * Verifica se o usuário está autenticado nas rotas de API
 * Retorna o usuário se autenticado, ou uma resposta 401 se não
 */
export async function requireApiAuth() {
  const supabase = createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      error: NextResponse.json(
        { error: 'Não autorizado. Faça login para continuar.' },
        { status: 401 }
      ),
    }
  }

  return { user }
}
