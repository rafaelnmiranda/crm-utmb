import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('deal_tags')
      .select(`
        *,
        tags (*)
      `)
      .eq('deal_id', params.id)

    if (error) throw error

    return NextResponse.json(data)
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
    const body = await request.json()
    const { tag_id } = body

    if (!tag_id) {
      return NextResponse.json(
        { error: 'tag_id is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('deal_tags')
      .insert([{
        deal_id: params.id,
        tag_id: tag_id,
      }])
      .select(`
        *,
        tags (*)
      `)
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const tag_id = searchParams.get('tag_id')

    if (!tag_id) {
      return NextResponse.json(
        { error: 'tag_id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('deal_tags')
      .delete()
      .eq('deal_id', params.id)
      .eq('tag_id', tag_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}



