import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { SponsorshipTier } from '@/types'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('sponsorship_tiers')
      .select('*')
      .order('value_brl', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}




