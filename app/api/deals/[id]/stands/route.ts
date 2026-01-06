import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isValidStandLocation, type StandCode } from '@/lib/expo/stands'

// GET: List all stands for a deal
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('deal_stands')
      .select('*')
      .eq('deal_id', params.id)
      .order('stand_code', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// POST: Add a stand to a deal
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { stand_code } = body

    if (!stand_code || typeof stand_code !== 'string') {
      return NextResponse.json(
        { error: 'stand_code é obrigatório' },
        { status: 400 }
      )
    }

    if (!isValidStandLocation(stand_code)) {
      return NextResponse.json(
        { error: 'Código de stand inválido. Use o formato A01…F08.' },
        { status: 400 }
      )
    }

    // Check if deal exists
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id')
      .eq('id', params.id)
      .single()

    if (dealError || !deal) {
      return NextResponse.json(
        { error: 'Deal não encontrado' },
        { status: 404 }
      )
    }

    // Check if stand is already assigned to another deal
    const { data: existingStand, error: existingError } = await supabase
      .from('deal_stands')
      .select(`
        deal_id,
        deals (
          id,
          organizations (
            name
          )
        )
      `)
      .eq('stand_code', stand_code)
      .single()

    if (existingStand && existingStand.deal_id !== params.id) {
      const deal = existingStand.deals as any
      const orgName = deal?.organizations?.name || 'outro deal'
      return NextResponse.json(
        { error: `O stand ${stand_code} já está ocupado por ${orgName}.` },
        { status: 409 }
      )
    }

    // Insert or ignore if already exists for this deal
    const { data, error } = await supabase
      .from('deal_stands')
      .insert({
        deal_id: params.id,
        stand_code: stand_code as StandCode,
      })
      .select()
      .single()

    if (error) {
      // If it's a unique constraint violation, it means the stand is already assigned to this deal
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Este stand já está atribuído a este deal.' },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao adicionar stand' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a stand from a deal
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const stand_code = searchParams.get('stand_code')

    if (!stand_code) {
      return NextResponse.json(
        { error: 'stand_code é obrigatório' },
        { status: 400 }
      )
    }

    if (!isValidStandLocation(stand_code)) {
      return NextResponse.json(
        { error: 'Código de stand inválido' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('deal_stands')
      .delete()
      .eq('deal_id', params.id)
      .eq('stand_code', stand_code)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao remover stand' },
      { status: 500 }
    )
  }
}


