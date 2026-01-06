import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

type SearchItem = {
  type: 'deal' | 'organization' | 'contact'
  id: string
  href: string
  title: string
  subtitle?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ query: q, items: [] satisfies SearchItem[] })
  }

  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const like = `%${q}%`

  // 1) Organizations
  const orgRes = await supabase
    .from('organizations')
    .select('id, name, website')
    .ilike('name', like)
    .order('name', { ascending: true })
    .limit(8)

  if (orgRes.error) {
    return NextResponse.json({ error: orgRes.error.message }, { status: 500 })
  }

  const orgs = (orgRes.data || []) as Array<{ id: string; name: string; website: string | null }>
  const orgIds = orgs.map((o) => o.id)

  // 2) Contacts
  const contactsRes = await supabase
    .from('contacts')
    .select('id, name, email, organization_id, organizations(name)')
    .or(`name.ilike.${like},email.ilike.${like}`)
    .order('created_at', { ascending: false })
    .limit(8)

  if (contactsRes.error) {
    return NextResponse.json({ error: contactsRes.error.message }, { status: 500 })
  }

  // 3) Deals
  const dealsByTitleRes = await supabase
    .from('deals')
    .select('id, title, type, organization_id, events(name, year), pipeline_stages(name), organizations(name)')
    .ilike('title', like)
    .order('created_at', { ascending: false })
    .limit(8)

  if (dealsByTitleRes.error) {
    return NextResponse.json({ error: dealsByTitleRes.error.message }, { status: 500 })
  }

  const dealsByOrgRes =
    orgIds.length > 0
      ? await supabase
          .from('deals')
          .select('id, title, type, organization_id, events(name, year), pipeline_stages(name), organizations(name)')
          .in('organization_id', orgIds)
          .order('created_at', { ascending: false })
          .limit(8)
      : { data: [], error: null as any }

  if ((dealsByOrgRes as any).error) {
    return NextResponse.json({ error: (dealsByOrgRes as any).error.message }, { status: 500 })
  }

  const dealsRaw = [
    ...(((dealsByTitleRes.data || []) as any[]) || []),
    ...((((dealsByOrgRes as any).data || []) as any[]) || []),
  ]

  const dealsUniq = new Map<string, any>()
  for (const d of dealsRaw) dealsUniq.set(d.id, d)
  const deals = [...dealsUniq.values()].slice(0, 10)

  const items: SearchItem[] = []

  for (const d of deals) {
    const orgName = d.organizations?.name || 'Sem empresa'
    const stageName = d.pipeline_stages?.name || null
    const eventLabel = d.events?.name ? `${d.events.name}${d.events.year ? ` ${d.events.year}` : ''}` : null
    const subtitleParts = [d.type, eventLabel, stageName, d.title].filter(Boolean)
    items.push({
      type: 'deal',
      id: d.id,
      href: `/deals/${d.id}`,
      title: orgName,
      subtitle: subtitleParts.join(' • '),
    })
  }

  for (const o of orgs) {
    items.push({
      type: 'organization',
      id: o.id,
      href: `/organizations/${o.id}`,
      title: o.name,
      subtitle: o.website || undefined,
    })
  }

  for (const c of (contactsRes.data || []) as any[]) {
    const orgName = c.organizations?.name || null
    items.push({
      type: 'contact',
      id: c.id,
      href: `/organizations/${c.organization_id}/contacts/${c.id}/edit`,
      title: c.name,
      subtitle: [c.email, orgName].filter(Boolean).join(' • ') || undefined,
    })
  }

  // lightweight stable ordering: deals first, then orgs, then contacts
  const order: Record<SearchItem['type'], number> = { deal: 0, organization: 1, contact: 2 }
  items.sort((a, b) => order[a.type] - order[b.type])

  return NextResponse.json({ query: q, items })
}

