import { NextResponse } from 'next/server'
import { createAdminClient, createServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Verificar se o usuário é admin
    await requireAdmin()

    const body = await request.json().catch(() => ({}))
    const { email, password, name } = body

    // Validações
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Senha é obrigatória e deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name || email.split('@')[0],
      }
    })
    
    if (error) {
      // Tratar erros comuns
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso!',
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    }, { status: 201 })
  } catch (error: any) {
    // Erro de autorização
    if (error.message.includes('Acesso negado')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}




