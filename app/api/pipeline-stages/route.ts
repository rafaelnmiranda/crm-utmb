import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { PipelineStage } from '@/types'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .order('position', { ascending: true })

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
    const supabase = createServerClient()
    const body: Partial<PipelineStage> = await request.json()

    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert([{
        name: body.name,
        position: body.position || 0,
        color: body.color || '#A0CED9',
        is_lost: body.is_lost || false,
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




