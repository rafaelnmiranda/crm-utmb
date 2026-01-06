import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body: { tier_id: string } = await request.json()

    if (!body.tier_id) {
      return NextResponse.json(
        { error: 'tier_id é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar os counterparts do tier
    const { data: tierCounterparts, error: counterpartsError } = await supabase
      .from('sponsorship_tier_counterparts')
      .select(`
        *,
        sponsorship_counterparts (*)
      `)
      .eq('tier_id', body.tier_id)
      .order('sort_order', { ascending: true })

    if (counterpartsError) {
      // Mensagem mais clara para erro de tabela não encontrada
      if (counterpartsError.message?.includes('schema cache') || 
          counterpartsError.message?.includes('does not exist') ||
          counterpartsError.code === '42P01') {
        throw new Error(
          'Tabela sponsorship_tier_counterparts não encontrada. ' +
          'Por favor, certifique-se de que a migração 010 e 012 foram aplicadas ao banco de dados.'
        )
      }
      throw counterpartsError
    }

    if (!tierCounterparts || tierCounterparts.length === 0) {
      return NextResponse.json(
        { error: 'Esta cota não possui entregáveis cadastrados' },
        { status: 404 }
      )
    }

    // Verificar quais entregáveis já existem no deal para evitar duplicatas
    const { data: existingCounterparts, error: existingError } = await supabase
      .from('deal_counterparts')
      .select('counterpart_id')
      .eq('deal_id', params.id)
      .not('counterpart_id', 'is', null)

    if (existingError) throw existingError

    const existingCounterpartIds = new Set(
      (existingCounterparts || [])
        .map((cp: { counterpart_id: string }) => cp.counterpart_id)
        .filter((id: string | null) => id !== null)
    )

    // Criar deal_counterparts baseado nos tier counterparts
    // Filtrar os que já existem
    const dealCounterparts = tierCounterparts
      .filter((tierCp: any) => {
        const counterpartId = tierCp.counterpart_id
        return !existingCounterpartIds.has(counterpartId)
      })
      .map((tierCp: any) => ({
        deal_id: params.id,
        counterpart_id: tierCp.counterpart_id,
        name: tierCp.sponsorship_counterparts?.name || '',
        included: tierCp.included,
        details: tierCp.sponsorship_counterparts?.details || tierCp.tier_details || null,
        custom: false,
      }))

    if (dealCounterparts.length === 0) {
      return NextResponse.json(
        { 
          message: 'Todos os entregáveis desta cota já estão no deal',
          added: 0
        },
        { status: 200 }
      )
    }

    const { data: inserted, error: insertError } = await supabase
      .from('deal_counterparts')
      .insert(dealCounterparts)
      .select()

    if (insertError) throw insertError

    return NextResponse.json({
      message: `${inserted.length} entregável(is) adicionado(s) com sucesso`,
      added: inserted.length,
      counterparts: inserted
    }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
