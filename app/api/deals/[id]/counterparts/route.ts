import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { DealCounterpart } from '@/types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('deal_counterparts')
      .select('*')
      .eq('deal_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body: Partial<DealCounterpart> = await request.json()

    const { data, error } = await supabase
      .from('deal_counterparts')
      .insert([{
        deal_id: params.id,
        counterpart_id: body.counterpart_id,
        name: body.name,
        included: body.included ?? true,
        details: body.details,
        custom: body.custom ?? false,
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
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
    const supabase = createServerClient()
    const { error } = await supabase
      .from('deal_counterparts')
      .delete()
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




