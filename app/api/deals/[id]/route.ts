import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Deal } from '@/types'
import { parseStandLocation } from '@/lib/expo/stands'
import { requireApiAuth } from '@/lib/api-auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        organizations (*),
        pipeline_stages (*),
        events (*),
        sponsorship_tiers (*),
        deal_tags (
          *,
          tags (*)
        ),
        deal_counterparts (*)
      `)
      .eq('id', params.id)
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireApiAuth()
    if (authResult.error) return authResult.error

    const supabase = createServerClient()
    const body: Partial<Deal> = await request.json()

    // stand_location: validar quando presente
    let normalizedStandLocation: string | null | undefined = undefined
    if (body.stand_location !== undefined) {
      if (body.stand_location === null) {
        normalizedStandLocation = null
      } else {
        const parsed = parseStandLocation(body.stand_location)
        if (!parsed) {
          return NextResponse.json(
            { error: 'Localização de stand inválida. Use o formato A01…F08.' },
            { status: 400 }
          )
        }
        normalizedStandLocation = parsed
      }
    }

    // Fetch current deal state so we can log meaningful history entries
    const { data: currentDeal, error: currentDealError } = await supabase
      .from('deals')
      .select('id, stage_id, value_monetary, value_barter, expected_close_date')
      .eq('id', params.id)
      .single()

    if (currentDealError || !currentDeal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }

    // Aceitar updates parciais: só incluir campos presentes no payload
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (body.title !== undefined) updatePayload.title = body.title
    if (body.organization_id !== undefined) updatePayload.organization_id = body.organization_id
    if (body.event_id !== undefined) updatePayload.event_id = body.event_id
    if (body.stage_id !== undefined) updatePayload.stage_id = body.stage_id
    if (body.sponsorship_tier_id !== undefined) updatePayload.sponsorship_tier_id = body.sponsorship_tier_id
    if (body.type !== undefined) updatePayload.type = body.type
    if (body.value_monetary !== undefined) updatePayload.value_monetary = body.value_monetary
    if (body.value_barter !== undefined) updatePayload.value_barter = body.value_barter
    if (body.currency !== undefined) updatePayload.currency = body.currency
    if (body.barter_description !== undefined) updatePayload.barter_description = body.barter_description
    if (body.expected_close_date !== undefined) updatePayload.expected_close_date = body.expected_close_date
    if (normalizedStandLocation !== undefined) updatePayload.stand_location = normalizedStandLocation

    const { data, error } = await supabase
      .from('deals')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Se sponsorship_tier_id foi definido/atualizado, criar snapshot se ainda não existir
    if (data && body.sponsorship_tier_id !== undefined && data.sponsorship_tier_id) {
      try {
        // Verificar se já existem deal_counterparts
        const { data: existingCounterparts, error: checkError } = await supabase
          .from('deal_counterparts')
          .select('id')
          .eq('deal_id', params.id)
          .limit(1)

        if (!checkError && (!existingCounterparts || existingCounterparts.length === 0)) {
          // Buscar os counterparts do tier via join
          const { data: tierCounterparts, error: counterpartsError } = await supabase
            .from('sponsorship_tier_counterparts')
            .select(`
              *,
              sponsorship_counterparts (*)
            `)
            .eq('tier_id', data.sponsorship_tier_id)

          if (!counterpartsError && tierCounterparts && tierCounterparts.length > 0) {
            // Criar deal_counterparts baseado nos tier counterparts
            const dealCounterparts = tierCounterparts.map((tierCp: any) => ({
              deal_id: params.id,
              counterpart_id: tierCp.counterpart_id,
              name: tierCp.sponsorship_counterparts?.name || '',
              included: tierCp.included,
              details: tierCp.sponsorship_counterparts?.details || null,
              custom: false,
            }))

            const { error: insertError } = await supabase
              .from('deal_counterparts')
              .insert(dealCounterparts)

            if (insertError) {
              console.error('Erro ao criar snapshot de counterparts:', insertError)
              // Não falha o request principal
            }
          }
        }
      } catch (snapshotError) {
        console.error('Erro ao criar snapshot de counterparts:', snapshotError)
        // Não falha o request principal
      }
    }

    // Auto-history for important changes (keeps timeline complete without extra work)
    const changes: string[] = []
    const nextStageId = body.stage_id !== undefined ? (body.stage_id ?? null) : (currentDeal.stage_id ?? null)
    const nextValueMonetary = body.value_monetary !== undefined ? (body.value_monetary ?? null) : (currentDeal.value_monetary ?? null)
    const nextValueBarter = body.value_barter !== undefined ? (body.value_barter ?? null) : (currentDeal.value_barter ?? null)
    const nextExpectedCloseDate = body.expected_close_date !== undefined ? (body.expected_close_date ?? null) : (currentDeal.expected_close_date ?? null)

    if (currentDeal.stage_id !== nextStageId) {
      changes.push(`Estágio: ${currentDeal.stage_id ?? '—'} → ${nextStageId ?? '—'}`)
    }
    if (currentDeal.value_monetary !== nextValueMonetary) {
      changes.push(`Valor monetário: ${currentDeal.value_monetary ?? '—'} → ${nextValueMonetary ?? '—'}`)
    }
    if (currentDeal.value_barter !== nextValueBarter) {
      changes.push(`Valor permuta: ${currentDeal.value_barter ?? '—'} → ${nextValueBarter ?? '—'}`)
    }
    if (currentDeal.expected_close_date !== nextExpectedCloseDate) {
      changes.push(`Fechamento: ${currentDeal.expected_close_date ?? '—'} → ${nextExpectedCloseDate ?? '—'}`)
    }

    if (changes.length > 0) {
      await supabase
        .from('activities')
        .insert([{
          deal_id: params.id,
          type: 'note',
          title: 'Sistema',
          description: `Sistema: alterações no deal\n- ${changes.join('\n- ')}`,
          activity_date: new Date().toISOString(),
          completed: true,
        }])
    }

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
      .from('deals')
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


