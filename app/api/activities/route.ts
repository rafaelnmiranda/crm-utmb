import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Activity } from '@/types'
import { requireApiAuth } from '@/lib/api-auth'

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const dealId = searchParams.get('deal_id')
    const type = searchParams.get('type')
    const completedParam = searchParams.get('completed')

    let query = supabase
      .from('activities')
      .select('*')
      .order('activity_date', { ascending: false })

    if (dealId) {
      query = query.eq('deal_id', dealId)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (completedParam !== null) {
      const completed = completedParam === 'true'
      query = query.eq('completed', completed)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await requireApiAuth()
    if (authResult.error) return authResult.error

    const supabase = createServerClient()
    const body: Partial<Activity> = await request.json()
    const activityDate = body.activity_date ?? new Date().toISOString()

    // Para tarefas, sempre garantir que completed seja false
    const isTask = body.type === 'task'
    // Garantir que completed seja sempre um booleano, não string
    let completed: boolean
    if (isTask) {
      completed = false
    } else {
      // Para outras atividades, usar o valor enviado ou false por padrão
      if (typeof body.completed === 'boolean') {
        completed = body.completed
      } else if (typeof body.completed === 'string') {
        completed = body.completed === 'true'
      } else {
        completed = false
      }
    }

    const { data, error } = await supabase
      .from('activities')
      .insert([{
        deal_id: body.deal_id,
        type: body.type,
        title: (body as any).title ?? null,
        description: body.description,
        activity_date: activityDate,
        next_action: body.next_action,
        next_action_date: body.next_action_date,
        completed: completed,
      }])
      .select()
      .single()

    if (error) throw error

    // Se uma tarefa foi criada como concluída por engano, corrigir
    if (isTask && data?.completed === true) {
      const { data: updated, error: updateError } = await supabase
        .from('activities')
        .update({ completed: false })
        .eq('id', data.id)
        .select()
        .single()
      
      if (!updateError && updated) {
        return NextResponse.json(updated, { status: 201 })
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}


