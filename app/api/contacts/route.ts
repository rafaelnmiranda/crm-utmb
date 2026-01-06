import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Contact } from '@/types'

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organization_id')

    let query = supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query

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
    const body: Partial<Contact> = await request.json()

    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        organization_id: body.organization_id,
        name: body.name,
        email: body.email,
        phone: body.phone,
        position: body.position,
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




