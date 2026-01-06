import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import KanbanBoard from './components/KanbanBoard'
import type { Deal, PipelineStage, Event } from '@/types'

export default async function KanbanPage() {
  await requireAuth()
  const supabase = createServerClient()

  // Buscar deals com relacionamentos
  const { data: deals } = await supabase
    .from('deals')
    .select(`
      *,
      organizations (*),
      pipeline_stages (*),
      events (*),
      deal_tags (
        *,
        tags (*)
      )
    `)
    .order('created_at', { ascending: false })

  // Buscar estágios
  const { data: stages } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('position', { ascending: true })

  // Buscar eventos
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('year', { ascending: false })

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Pipeline</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground">
            Visualize e gerencie seus deals no pipeline
          </p>
        </div>
        <Link href="/deals/new">
          <Button className="w-full sm:w-auto">+ Novo Deal</Button>
        </Link>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard 
          initialDeals={deals || []} 
          stages={stages || []}
          events={events || []}
        />
      </div>
    </div>
  )
}

