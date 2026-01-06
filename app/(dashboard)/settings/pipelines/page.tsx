import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import type { PipelineStage } from '@/types'

export default async function PipelinesSettingsPage() {
  const supabase = createServerClient()
  const { data: stages, error } = await supabase
    .from('pipeline_stages')
    .select('*')
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching stages:', error)
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
            Pipeline
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gerencie os estágios do seu pipeline de vendas. Reordene, edite cores e nomes.
          </p>
        </div>

        {/* Stages List */}
        <div className="space-y-3">
          {stages && stages.length > 0 ? (
            stages.map((stage: PipelineStage) => (
              <div
                key={stage.id}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stage.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{stage.name}</h3>
                    {stage.is_lost && (
                      <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                        Perdido
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Posição {stage.position}
                  </p>
                </div>
                <Link
                  href={`/settings/pipelines/${stage.id}`}
                  className="text-sm text-primary hover:underline whitespace-nowrap"
                >
                  Editar
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum estágio configurado ainda.</p>
            </div>
          )}
        </div>

        {/* Add New Button */}
        <div className="mt-6">
          <Link
            href="/settings/pipelines/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Estágio
          </Link>
        </div>
      </div>
    </div>
  )
}



