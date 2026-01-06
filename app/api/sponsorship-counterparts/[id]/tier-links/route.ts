import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('sponsorship_tier_counterparts')
      .select(`
        *,
        sponsorship_tiers (*)
      `)
      .eq('counterpart_id', params.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Transformar resposta
    const transformed = data?.map((link: any) => ({
      id: link.id,
      tier_id: link.tier_id,
      counterpart_id: link.counterpart_id,
      included: link.included,
      tier_details: link.tier_details,
      sort_order: link.sort_order,
      tier: link.sponsorship_tiers,
    })) || []

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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const tierId = searchParams.get('tier_id')

    if (!tierId) {
      return NextResponse.json(
        { error: 'tier_id é obrigatório' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('sponsorship_tier_counterparts')
      .delete()
      .eq('counterpart_id', params.id)
      .eq('tier_id', tierId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
