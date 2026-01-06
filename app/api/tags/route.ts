import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Tag } from '@/types'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })

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
    const body: Partial<Tag> = await request.json()

    const { data, error } = await supabase
      .from('tags')
      .insert([{
        name: body.name,
        color: body.color || '#3B82F6',
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



