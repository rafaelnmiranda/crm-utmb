import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Event, PipelineStage } from '@/types'

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function brl(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type DealRow = {
  id: string
  stage_id: string | null
  event_id: string
  value_monetary: number | string | null
  value_barter: number | string | null
}

export default async function DashboardPage({
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
      <div className="p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nenhum evento encontrado. Crie um evento em Configurações.
        </p>
      </div>
    )
  }

  const [
    { data: stages },
    { data: deals },
    { count: organizationsCount },
    { count: contactsCount },
  ] = await Promise.all([
    supabase.from('pipeline_stages').select('*').order('position', { ascending: true }),
    supabase
      .from('deals')
      .select('id, stage_id, event_id, value_monetary, value_barter')
      .eq('event_id', activeEventId)
      .order('created_at', { ascending: false }),
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
  ])

  const dealsList = (deals || []) as DealRow[]
  const stagesList = (stages || []) as PipelineStage[]
  const eventsList = (events || []) as Event[]

  const totalDeals = dealsList.length
  const totalMonetary = dealsList.reduce((acc, d) => acc + toNumber(d.value_monetary), 0)
  const totalBarter = dealsList.reduce((acc, d) => acc + toNumber(d.value_barter), 0)

  const perStage = new Map<
    string,
    { stageId: string; name: string; count: number; monetary: number; barter: number }
  >()

  for (const s of stagesList) {
    perStage.set(s.id, { stageId: s.id, name: s.name, count: 0, monetary: 0, barter: 0 })
  }

  const noStageKey = '__no_stage__'
  perStage.set(noStageKey, { stageId: noStageKey, name: 'Sem estágio', count: 0, monetary: 0, barter: 0 })

  for (const d of dealsList) {
    const key = d.stage_id || noStageKey
    if (!perStage.has(key)) {
      perStage.set(key, { stageId: key, name: 'Sem estágio', count: 0, monetary: 0, barter: 0 })
    }
    const row = perStage.get(key)!
    row.count += 1
    row.monetary += toNumber(d.value_monetary)
    row.barter += toNumber(d.value_barter)
  }

  const stageRows = [
    ...stagesList.map((s) => perStage.get(s.id)!),
    perStage.get(noStageKey)!,
  ].filter((r) => r.count > 0 || r.stageId !== noStageKey)

  const activeEvent = eventsList.find((e) => e.id === activeEventId) || null

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Métricas do pipeline por estágio {activeEvent ? `(${activeEvent.name})` : ''}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {eventsList.map((e) => {
          const isActive = e.id === activeEventId
          return (
            <Link
              key={e.id}
              href={`/dashboard?eventId=${e.id}`}
              className={[
                'px-3 py-1.5 rounded-full text-xs md:text-sm border transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground',
              ].join(' ')}
            >
              {e.name}
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total de deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalDeals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Valor monetário (soma)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{brl(totalMonetary)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Valor permuta (soma)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{brl(totalBarter)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Empresas cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{organizationsCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Contatos cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{contactsCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Por estágio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 pr-4 font-medium">Estágio</th>
                  <th className="py-2 pr-4 font-medium">Deals</th>
                  <th className="py-2 pr-4 font-medium">Monetário</th>
                  <th className="py-2 pr-4 font-medium">Permuta</th>
                </tr>
              </thead>
              <tbody>
                {stageRows.map((r) => (
                  <tr key={r.stageId} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-foreground">{r.name}</td>
                    <td className="py-2 pr-4 text-foreground">{r.count}</td>
                    <td className="py-2 pr-4 text-foreground">{brl(r.monetary)}</td>
                    <td className="py-2 pr-4 text-foreground">{brl(r.barter)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

