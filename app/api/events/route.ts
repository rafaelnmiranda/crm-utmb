import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Event } from '@/types'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('year', { ascending: false })

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
    const body: Partial<Event> = await request.json()

    const { data, error } = await supabase
      .from('events')
      .insert([{
        name: body.name,
        year: body.year,
        start_date: body.start_date,
        end_date: body.end_date,
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




