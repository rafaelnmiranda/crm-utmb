import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import type { Deal, Event, Organization, PipelineStage } from '@/types'
import ExpoMapClient from './components/ExpoMapClient'

type DealWithRelations = Deal & {
  organizations?: Organization | null
  pipeline_stages?: PipelineStage | null
  events?: Event | null
}

export default async function ExpoPage({
  searchParams,
}: {
  searchParams?: { eventId?: string }
}) {
  await requireAuth()
  const supabase = createServerClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('year', { ascending: false })

  const activeEventId = searchParams?.eventId || events?.[0]?.id || null

  if (!activeEventId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">EXPO</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nenhum evento encontrado. Crie um evento em Configurações.
        </p>
      </div>
    )
  }

  const { data: deals } = await supabase
    .from('deals')
    .select(`
      *,
      organizations (*),
      pipeline_stages (*),
      events (*),
      deal_stands (*)
    `)
    .eq('event_id', activeEventId)
    .order('created_at', { ascending: false })

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">EXPO</h1>
        <p className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground">
          Mapa interativo dos estandes (A01…F08) conectado aos deals por evento
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <ExpoMapClient
          events={(events || []) as Event[]}
          activeEventId={activeEventId}
          initialDeals={(deals || []) as DealWithRelations[]}
        />
      </div>
    </div>
  )
}




