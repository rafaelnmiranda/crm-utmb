import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SponsorshipTierCounterpart, SponsorshipCounterpart } from '@/types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('sponsorship_tier_counterparts')
      .select(`
        *,
        sponsorship_counterparts (*)
      `)
      .eq('tier_id', params.id)
      .order('sort_order', { ascending: true })

    if (error) throw error

    // Transformar para um formato mais fácil de usar no frontend
    const transformed = data?.map((tierCp: any) => ({
      id: tierCp.id,
      tier_id: tierCp.tier_id,
      counterpart_id: tierCp.counterpart_id,
      included: tierCp.included,
      tier_details: tierCp.tier_details,
      sort_order: tierCp.sort_order,
      name: tierCp.sponsorship_counterparts?.name,
      details: tierCp.sponsorship_counterparts?.details,
      counterpart: tierCp.sponsorship_counterparts,
    })) || []

    return NextResponse.json(transformed)
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
    const body: { name?: string; counterpart_id?: string; included?: boolean; tier_details?: string; details?: string } = await request.json()

    let counterpartId: string

    if (body.counterpart_id) {
      // Usar entregável existente
      counterpartId = body.counterpart_id
    } else if (body.name && body.name.trim()) {
      // Criar novo entregável único ou usar existente
      const name = body.name.trim()
      
      // Verificar se já existe um entregável com esse nome
      const { data: existing, error: checkError } = await supabase
        .from('sponsorship_counterparts')
        .select('id')
        .eq('name', name)
        .single()

      if (existing) {
        counterpartId = existing.id
      } else {
        // Criar novo entregável único
        const { data: newCounterpart, error: createError } = await supabase
          .from('sponsorship_counterparts')
          .insert([{
            name: name,
            details: body.details || null,
          }])
          .select()
          .single()

        if (createError) throw createError
        counterpartId = newCounterpart.id
      }
    } else {
      return NextResponse.json(
        { error: 'Nome ou counterpart_id é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se já existe o relacionamento
    const { data: existingRelation, error: checkRelationError } = await supabase
      .from('sponsorship_tier_counterparts')
      .select('id')
      .eq('tier_id', params.id)
      .eq('counterpart_id', counterpartId)
      .single()

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Este entregável já está associado a esta cota' },
        { status: 400 }
      )
    }

    // Criar relacionamento
    const { data, error } = await supabase
      .from('sponsorship_tier_counterparts')
      .insert([{
        tier_id: params.id,
        counterpart_id: counterpartId,
        included: body.included ?? true,
        tier_details: body.tier_details || null,
      }])
      .select(`
        *,
        sponsorship_counterparts (*)
      `)
      .single()

    if (error) throw error

    // Transformar resposta
    const transformed = {
      id: data.id,
      tier_id: data.tier_id,
      counterpart_id: data.counterpart_id,
      included: data.included,
      tier_details: data.tier_details,
      sort_order: data.sort_order,
      name: (data as any).sponsorship_counterparts?.name,
      details: (data as any).sponsorship_counterparts?.details,
      counterpart: (data as any).sponsorship_counterparts,
    }

    return NextResponse.json(transformed, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}




