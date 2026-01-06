import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import type { SponsorshipCounterpart } from '@/types'

export default async function SponsorshipCounterpartsSettingsPage() {
  const supabase = createServerClient()
  const { data: counterparts, error } = await supabase
    .from('sponsorship_counterparts')
    .select(`
      *,
      sponsorship_tier_counterparts (
        id,
        tier_id,
        sponsorship_tiers (
          id,
          name
        )
      )
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching counterparts:', error)
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
            Entregáveis
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gerencie todos os entregáveis disponíveis e seus vínculos com as cotas de patrocínio.
          </p>
        </div>

        {/* Counterparts List */}
        <div className="space-y-3">
          {counterparts && counterparts.length > 0 ? (
            counterparts.map((counterpart: any) => {
              const tierLinks = counterpart.sponsorship_tier_counterparts || []
              return (
                <div
                  key={counterpart.id}
                  className="flex items-start justify-between gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1">{counterpart.name}</h3>
                    {counterpart.details && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {counterpart.details}
                      </p>
                    )}
                    {tierLinks.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Vinculado a:</span>
                        {tierLinks.map((link: any) => (
                          <span
                            key={link.id}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {link.sponsorship_tiers?.name || 'Cota desconhecida'}
                          </span>
                        ))}
                      </div>
                    )}
                    {tierLinks.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Nenhum vínculo com cotas
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/settings/sponsorship-counterparts/${counterpart.id}`}
                    className="text-sm text-primary hover:underline whitespace-nowrap"
                  >
                    Editar
                  </Link>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum entregável configurado ainda.</p>
            </div>
          )}
        </div>

        {/* Add New Button */}
        <div className="mt-6">
          <Link
            href="/settings/sponsorship-counterparts/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Entregável
          </Link>
        </div>
      </div>
    </div>
  )
}
