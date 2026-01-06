import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SponsorshipCounterpart } from '@/types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('sponsorship_counterparts')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data as SponsorshipCounterpart)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body: { name?: string; details?: string } = await request.json()

    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json(
        { error: 'Nome não pode ser vazio' },
        { status: 400 }
      )
    }

    // Verificar se o nome já existe em outro entregável
    if (body.name) {
      const { data: existing, error: checkError } = await supabase
        .from('sponsorship_counterparts')
        .select('id')
        .eq('name', body.name.trim())
        .neq('id', params.id)
        .single()

      if (existing) {
        return NextResponse.json(
          { error: 'Já existe um entregável com este nome' },
          { status: 400 }
        )
      }
    }

    const updatePayload: Record<string, unknown> = {}
    if (body.name !== undefined) updatePayload.name = body.name.trim()
    if (body.details !== undefined) updatePayload.details = body.details || null

    const { data, error } = await supabase
      .from('sponsorship_counterparts')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data as SponsorshipCounterpart)
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

    // Verificar se há vínculos com cotas
    const { data: tierLinks, error: checkError } = await supabase
      .from('sponsorship_tier_counterparts')
      .select('id, tier_id')
      .eq('counterpart_id', params.id)
      .limit(1)

    if (checkError) throw checkError

    if (tierLinks && tierLinks.length > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar este entregável pois ele está vinculado a uma ou mais cotas. Remova os vínculos primeiro.',
          tier_links: tierLinks.length
        },
        { status: 400 }
      )
    }

    // Verificar se há vínculos com deals
    const { data: dealLinks, error: dealCheckError } = await supabase
      .from('deal_counterparts')
      .select('id')
      .eq('counterpart_id', params.id)
      .limit(1)

    if (dealCheckError) throw dealCheckError

    if (dealLinks && dealLinks.length > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível deletar este entregável pois ele está vinculado a um ou mais deals.',
          deal_links: dealLinks.length
        },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('sponsorship_counterparts')
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
