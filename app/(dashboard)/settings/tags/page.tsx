import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import type { Tag } from '@/types'

export default async function TagsSettingsPage() {
  const supabase = createServerClient()
  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching tags:', error)
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
            Tags
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gerencie as tags disponíveis para classificar e organizar oportunidades.
          </p>
        </div>

        {/* Tags List */}
        <div className="space-y-3">
          {tags && tags.length > 0 ? (
            tags.map((tag: Tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{tag.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tag.color}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/settings/tags/${tag.id}`}
                  className="text-sm text-primary hover:underline whitespace-nowrap"
                >
                  Editar
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma tag configurada ainda.</p>
            </div>
          )}
        </div>

        {/* Add New Button */}
        <div className="mt-6">
          <Link
            href="/settings/tags/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar Tag
          </Link>
        </div>
      </div>
    </div>
  )
}


