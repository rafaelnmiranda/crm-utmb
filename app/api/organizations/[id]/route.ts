import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { Organization } from '@/types'
import { requireApiAuth } from '@/lib/api-auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireApiAuth()
    if (authResult.error) return authResult.error

    const supabase = createServerClient()
    const body: Partial<Organization> = await request.json()

    const { data, error } = await supabase
      .from('organizations')
      .update({
        name: body.name,
        partner_subcategory: body.partner_subcategory,
        website: body.website,
        sector_ids: body.sector_ids,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
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
    const authResult = await requireApiAuth()
    if (authResult.error) return authResult.error

    const supabase = createServerClient()
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}


