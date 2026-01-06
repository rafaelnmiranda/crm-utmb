import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Activity } from '@/types'
import { requireApiAuth } from '@/lib/api-auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireApiAuth()
    if (authResult.error) return authResult.error

    const supabase = createServerClient()
    const body: Partial<Activity> = await request.json()

    // Construir objeto de atualização apenas com campos fornecidos
    const updateData: any = {}
    if (body.type !== undefined) updateData.type = body.type
    if ((body as any).title !== undefined) updateData.title = (body as any).title ?? null
    if (body.description !== undefined) updateData.description = body.description
    if (body.activity_date !== undefined) updateData.activity_date = body.activity_date
    if (body.next_action !== undefined) updateData.next_action = body.next_action
    if (body.next_action_date !== undefined) updateData.next_action_date = body.next_action_date
    if (body.completed !== undefined) updateData.completed = body.completed

    const { data, error } = await supabase
      .from('activities')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireApiAuth()
    if (authResult.error) return authResult.error

    const supabase = createServerClient()
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

