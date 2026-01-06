import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { DealCounterpart } from '@/types'

export async function PUT(
  request: Request,
  { params }: { params: { id: string; counterpartId: string } }
) {
  try {
    const supabase = createServerClient()
    const body: Partial<DealCounterpart> = await request.json()

    const { data, error } = await supabase
      .from('deal_counterparts')
      .update({
        name: body.name,
        included: body.included,
        details: body.details,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.counterpartId)
      .eq('deal_id', params.id)
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
  { params }: { params: { id: string; counterpartId: string } }
) {
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('deal_counterparts')
      .delete()
      .eq('id', params.counterpartId)
      .eq('deal_id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}




