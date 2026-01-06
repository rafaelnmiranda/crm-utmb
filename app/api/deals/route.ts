import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Deal } from '@/types'
import { parseStandLocation } from '@/lib/expo/stands'
import { requireApiAuth } from '@/lib/api-auth'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        organizations (*),
        pipeline_stages (*),
        events (*),
        deal_tags (
          *,
          tags (*)
        )
      `)
      .order('created_at', { ascending: false })

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
    const body: Partial<Deal> = await request.json()

    // Validação de campos obrigatórios
    if (!body.organization_id) {
      return NextResponse.json(
        { error: 'Empresa é obrigatória' },
        { status: 400 }
      )
    }

    if (!body.event_id) {
      return NextResponse.json(
        { error: 'Evento é obrigatório' },
        { status: 400 }
      )
    }

    // Validação de valores numéricos
    if (body.value_monetary !== null && body.value_monetary !== undefined) {
      if (isNaN(Number(body.value_monetary)) || Number(body.value_monetary) < 0) {
        return NextResponse.json(
          { error: 'Valor monetário deve ser um número positivo' },
          { status: 400 }
        )
      }
    }

    if (body.value_barter !== null && body.value_barter !== undefined) {
      if (isNaN(Number(body.value_barter)) || Number(body.value_barter) < 0) {
        return NextResponse.json(
          { error: 'Valor em permuta deve ser um número positivo' },
          { status: 400 }
        )
      }
    }

    // Validação de data
    if (body.expected_close_date) {
      const date = new Date(body.expected_close_date)
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Data esperada de fechamento inválida' },
          { status: 400 }
        )
      }
    }

    // Validação de stand_location (quando fornecido)
    if (body.stand_location !== undefined && body.stand_location !== null) {
      const parsed = parseStandLocation(body.stand_location)
      if (!parsed) {
        return NextResponse.json(
          { error: 'Localização de stand inválida. Use o formato A01…F08.' },
          { status: 400 }
        )
      }
      body.stand_location = parsed
    }

    const { data, error } = await supabase
      .from('deals')
      .insert([{
        title: body.title || null,
        organization_id: body.organization_id,
        event_id: body.event_id,
        stage_id: body.stage_id || null,
        sponsorship_tier_id: body.sponsorship_tier_id || null,
        type: body.type || null,
        value_monetary: body.value_monetary !== null && body.value_monetary !== undefined ? Number(body.value_monetary) : null,
        value_barter: body.value_barter !== null && body.value_barter !== undefined ? Number(body.value_barter) : null,
        currency: body.currency || 'BRL',
        barter_description: body.barter_description || null,
        stand_location: body.stand_location || null,
        expected_close_date: body.expected_close_date || null,
      }])
      .select()
      .single()

    if (error) {
      // Tratamento específico de erros do Supabase
      let errorMessage = 'Erro ao criar deal'
      
      if (error.code === '23503') {
        // Foreign key violation
        if (error.message.includes('organization_id')) {
          errorMessage = 'Empresa selecionada não existe'
        } else if (error.message.includes('event_id')) {
          errorMessage = 'Evento selecionado não existe'
        } else if (error.message.includes('stage_id')) {
          errorMessage = 'Estágio selecionado não existe'
        } else if (error.message.includes('sponsorship_tier_id')) {
          errorMessage = 'Cota de patrocínio selecionada não existe'
        } else {
          errorMessage = 'Referência inválida. Verifique se todos os dados selecionados existem.'
        }
      } else if (error.code === '23505') {
        // Unique violation
        errorMessage = 'Já existe um deal com essas informações'
      } else if (error.code === '23502') {
        // Not null violation
        errorMessage = 'Campos obrigatórios não foram preenchidos'
      } else if (error.message) {
        errorMessage = error.message
      }

      console.error('Erro ao criar deal:', error)
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Se houver sponsorship_tier_id, criar snapshot dos counterparts
    if (data && data.sponsorship_tier_id) {
      try {
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
            deal_id: data.id,
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
            // Não falha o request principal, apenas loga o erro
          }
        }
      } catch (snapshotError) {
        console.error('Erro ao criar snapshot de counterparts:', snapshotError)
        // Não falha o request principal
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('Erro inesperado ao criar deal:', error)
    
    // Tratamento de erros de parsing JSON
    if (error instanceof SyntaxError || error.message?.includes('JSON')) {
      return NextResponse.json(
        { error: 'Dados inválidos enviados' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro inesperado ao criar deal. Tente novamente.' },
      { status: 500 }
    )
  }
}


