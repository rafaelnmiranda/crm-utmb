import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import type { Event } from '@/types'

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

export default async function EventsSettingsPage() {
  const supabase = createServerClient()
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('year', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/settings" 
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Voltar para Configurações
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Eventos
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gerencie os eventos disponíveis no sistema.
          </p>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {events && events.length > 0 ? (
            events.map((event: Event) => (
              <div
                key={event.id}
                className="flex items-center justify-between gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{event.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Ano: {event.year}</span>
                    {event.start_date && (
                      <span>Início: {formatDate(event.start_date)}</span>
                    )}
                    {event.end_date && (
                      <span>Fim: {formatDate(event.end_date)}</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/settings/events/${event.id}`}
                  className="text-sm text-primary hover:underline whitespace-nowrap"
                >
                  Editar
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum evento configurado ainda.</p>
            </div>
          )}
        </div>

        {/* Add New Button */}
        <div className="mt-6">
          <Link
            href="/settings/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Evento
          </Link>
        </div>
      </div>
    </div>
  )
}



