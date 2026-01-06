import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import type { Sector, SectorCategory } from '@/types'

const categoryLabels: Record<SectorCategory, string> = {
  event_requirement: 'Event Requirement',
  protected_transitional: 'Protected (Transitional)',
  restricted_1: 'Restricted 1',
  restricted_2: 'Restricted 2',
  prohibited: 'Prohibited',
  open: 'Open',
}

const categoryColors: Record<SectorCategory, string> = {
  event_requirement: 'bg-blue-100 text-blue-700',
  protected_transitional: 'bg-yellow-100 text-yellow-700',
  restricted_1: 'bg-orange-100 text-orange-700',
  restricted_2: 'bg-red-100 text-red-700',
  prohibited: 'bg-gray-100 text-gray-700',
  open: 'bg-green-100 text-green-700',
}

export default async function SectorsSettingsPage() {
  const supabase = createServerClient()
  const { data: sectors, error } = await supabase
    .from('sectors')
    .select('*')
    .order('category', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching sectors:', error)
  }

  // Agrupar por categoria
  const sectorsByCategory = sectors?.reduce((acc, sector: Sector) => {
    if (!acc[sector.category]) {
      acc[sector.category] = []
    }
    acc[sector.category].push(sector)
    return acc
  }, {} as Record<SectorCategory, Sector[]>) || {}

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
            Setores
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gerencie a classificação de setores conforme regulamentação UTMB.
          </p>
        </div>

        {/* Sectors by Category */}
        <div className="space-y-6">
          {Object.entries(sectorsByCategory).map(([category, categorySectors]) => {
            const sectors = categorySectors as Sector[]
            return (
            <div key={category} className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className={`px-3 py-1 rounded text-sm ${categoryColors[category as SectorCategory]}`}>
                  {categoryLabels[category as SectorCategory]}
                </span>
                <span className="text-sm text-muted-foreground font-normal">
                  ({sectors.length} {sectors.length === 1 ? 'setor' : 'setores'})
                </span>
              </h2>
              <div className="space-y-2">
                {sectors.map((sector: Sector) => (
                  <div
                    key={sector.id}
                    className="flex items-center justify-between gap-4 p-3 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{sector.name}</h3>
                      {sector.description && (
                        <p className="text-sm text-muted-foreground mt-1">{sector.description}</p>
                      )}
                    </div>
                    <Link
                      href={`/settings/sectors/${sector.id}`}
                      className="text-sm text-primary hover:underline whitespace-nowrap"
                    >
                      Editar
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            )
          })}
        </div>

        {(!sectors || sectors.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum setor configurado ainda.</p>
          </div>
        )}

        {/* Add New Button */}
        <div className="mt-6">
          <Link
            href="/settings/sectors/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Setor
          </Link>
        </div>
      </div>
    </div>
  )
}



