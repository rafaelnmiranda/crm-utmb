import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = createServerClient()

  // Buscar contagens para mostrar estatísticas
  const [stagesResult, tiersResult, sectorsResult, tagsResult, counterpartsResult] = await Promise.all([
    supabase.from('pipeline_stages').select('id', { count: 'exact' }),
    supabase.from('sponsorship_tiers').select('id', { count: 'exact' }),
    supabase.from('sectors').select('id', { count: 'exact' }),
    supabase.from('tags').select('id', { count: 'exact' }),
    supabase.from('sponsorship_counterparts').select('id', { count: 'exact' }),
  ])

  const stagesCount = stagesResult.count || 0
  const tiersCount = tiersResult.count || 0
  const sectorsCount = sectorsResult.count || 0
  const tagsCount = tagsResult.count || 0
  const counterpartsCount = counterpartsResult.count || 0

  const settingsCategories = [
    {
      title: 'Pipeline',
      description: 'Gerencie os estágios do seu pipeline de vendas',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      href: '/settings/pipelines',
      count: stagesCount,
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Cotas de Patrocínio',
      description: 'Configure valores e contra-partidas das cotas',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/settings/sponsorship-tiers',
      count: tiersCount,
      color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Entregáveis',
      description: 'Gerencie todos os entregáveis e seus vínculos com cotas',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/settings/sponsorship-counterparts',
      count: counterpartsCount,
      color: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100',
      iconColor: 'text-cyan-600',
    },
    {
      title: 'Setores',
      description: 'Gerencie a classificação de setores UTMB',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: '/settings/sectors',
      count: sectorsCount,
      color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Eventos',
      description: 'Gerencie os eventos disponíveis no sistema',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/settings/events',
      count: null,
      color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Tags',
      description: 'Gerencie as tags disponíveis para classificar oportunidades',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      href: '/settings/tags',
      count: tagsCount,
      color: 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100',
      iconColor: 'text-pink-600',
    },
  ]

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Configurações
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Personalize e configure o sistema conforme suas necessidades
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {settingsCategories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className={`group relative border-2 rounded-lg p-6 transition-all duration-200 ${category.color}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`mb-4 ${category.iconColor}`}>
                    {category.icon}
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold mb-2">
                    {category.title}
                  </h2>
                  <p className="text-sm opacity-80 mb-4">
                    {category.description}
                  </p>
                  {category.count !== null && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{category.count}</span>
                      <span className="opacity-70">
                        {category.count === 1 ? 'item' : 'itens'} configurado{category.count === 1 ? '' : 's'}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`${category.iconColor} opacity-50 group-hover:opacity-100 transition-opacity`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
          <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">
            Sobre as Configurações
          </h3>
          <p className="text-sm text-muted-foreground">
            Use estas configurações para personalizar o comportamento do CRM. 
            As alterações afetarão todos os usuários do sistema e serão aplicadas imediatamente.
          </p>
        </div>
      </div>
    </div>
  )
}



