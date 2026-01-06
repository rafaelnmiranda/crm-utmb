import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Organization } from '@/types'
import { requireApiAuth } from '@/lib/api-auth'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
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
    const body: Partial<Organization> = await request.json()

    const { data, error } = await supabase
      .from('organizations')
      .insert([{
        name: body.name,
        partner_subcategory: body.partner_subcategory,
        website: body.website,
        sector_ids: body.sector_ids || [],
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


