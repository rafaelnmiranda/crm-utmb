import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SponsorshipCounterpart } from '@/types'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('sponsorship_counterparts')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return NextResponse.json(data as SponsorshipCounterpart[])
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const body: { name: string; details?: string } = await request.json()

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se já existe um entregável com esse nome
    const { data: existing, error: checkError } = await supabase
      .from('sponsorship_counterparts')
      .select('id')
      .eq('name', body.name.trim())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um entregável com este nome' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('sponsorship_counterparts')
      .insert([{
        name: body.name.trim(),
        details: body.details || null,
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data as SponsorshipCounterpart, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
