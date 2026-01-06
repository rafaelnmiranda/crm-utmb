import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SponsorshipTierCounterpart } from '@/types'

export async function PUT(
  request: Request,
  { params }: { params: { id: string; counterpartId: string } }
) {
  try {
    const supabase = createServerClient()
    const body: { included?: boolean; tier_details?: string } = await request.json()

    const updatePayload: Record<string, unknown> = {}
    if (body.included !== undefined) updatePayload.included = body.included
    if (body.tier_details !== undefined) updatePayload.tier_details = body.tier_details || null

    const { data, error } = await supabase
      .from('sponsorship_tier_counterparts')
      .update(updatePayload)
      .eq('id', params.counterpartId)
      .eq('tier_id', params.id)
      .select(`
        *,
        sponsorship_counterparts (*)
      `)
      .single()

    if (error) throw error

    // Transformar resposta
    const transformed = {
      id: data.id,
      tier_id: data.tier_id,
      counterpart_id: data.counterpart_id,
      included: data.included,
      tier_details: data.tier_details,
      sort_order: data.sort_order,
      name: (data as any).sponsorship_counterparts?.name,
      details: (data as any).sponsorship_counterparts?.details,
      counterpart: (data as any).sponsorship_counterparts,
    }

    return NextResponse.json(transformed)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; counterpartId: string } }
) {
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('sponsorship_tier_counterparts')
      .delete()
      .eq('id', params.counterpartId)
      .eq('tier_id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}