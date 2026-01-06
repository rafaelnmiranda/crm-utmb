import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import type { SponsorshipTier } from '@/types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function SponsorshipTiersSettingsPage() {
  const supabase = createServerClient()
  const { data: tiers, error } = await supabase
    .from('sponsorship_tiers')
    .select('*')
    .order('value_brl', { ascending: false })

  if (error) {
    console.error('Error fetching tiers:', error)
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
            Cotas de Patrocínio
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Configure valores e contra-partidas padrão das cotas de patrocínio.
          </p>
        </div>

        {/* Tiers List */}
        <div className="space-y-3">
          {tiers && tiers.length > 0 ? (
            tiers.map((tier: SponsorshipTier) => (
              <div
                key={tier.id}
                className="flex items-center justify-between gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1">{tier.name}</h3>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(tier.value_brl)}
                  </p>
                  {tier.description && (
                    <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                  )}
                </div>
                <Link
                  href={`/settings/sponsorship-tiers/${tier.id}`}
                  className="text-sm text-primary hover:underline whitespace-nowrap"
                >
                  Editar
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma cota configurada ainda.</p>
            </div>
          )}
        </div>

        {/* Add New Button */}
        <div className="mt-6">
          <Link
            href="/settings/sponsorship-tiers/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Cota
          </Link>
        </div>
      </div>
    </div>
  )
}



