import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getTextColorForBackground } from '@/lib/utils'
import type { Deal } from '@/types'

export default async function DealsPage() {
  await requireAuth()
  const supabase = createServerClient()
  
  const { data: deals, error } = await supabase
    .from('deals')
    .select(`
      *,
      organizations (*),
      pipeline_stages (*),
      events (*),
      sponsorship_tiers (*),
      deal_tags (
        *,
        tags (*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching deals:', error)
  }

  // Calcular estatísticas
  const totalDeals = deals?.length || 0
  const totalMonetary = deals?.reduce((sum, deal) => sum + (deal.value_monetary || 0), 0) || 0
  const totalBarter = deals?.reduce((sum, deal) => sum + (deal.value_barter || 0), 0) || 0
  const totalValue = totalMonetary + totalBarter
  
  const dealsByType = {
    patrocinador: deals?.filter(d => d.type === 'patrocinador').length || 0,
    parceiro: deals?.filter(d => d.type === 'parceiro').length || 0,
    expositor: deals?.filter(d => d.type === 'expositor').length || 0,
  }

  const dealsWithCloseDate = deals?.filter(d => d.expected_close_date).length || 0

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Deals</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie todas as oportunidades de negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/kanban">
            <Button variant="outline">Ver Pipeline</Button>
          </Link>
          <Link href="/deals/new">
            <Button>+ Novo Deal</Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalDeals}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              R$ {totalMonetary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} monetário + R$ {totalBarter.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} permuta
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Patrocinadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dealsByType.patrocinador}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expositores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dealsByType.expositor}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Parceiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dealsByType.parceiro}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Deals */}
      <div className="space-y-4">
        {deals && deals.length > 0 ? (
          deals.map((deal: any) => {
            const organization = deal.organizations
            const stage = deal.pipeline_stages
            const event = deal.events
            const tier = deal.sponsorship_tiers
            const dealTags = deal.deal_tags || []

            return (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {organization ? organization.name : 'Sem empresa'}
                      </CardTitle>
                      <CardDescription className="mt-2 space-y-1">
                        {deal.type && (
                          <span className="inline-block rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground mr-2">
                            {deal.type}
                          </span>
                        )}
                        {event && (
                          <span className="text-xs text-muted-foreground">
                            {event.name} {event.year && `(${event.year})`}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    {stage && (
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ml-2 ${
                          getTextColorForBackground(stage.color) === 'white' 
                            ? 'text-white' 
                            : 'text-gray-900'
                        }`}
                        style={{ backgroundColor: stage.color }}
                      >
                        {stage.name}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {deal.title && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {deal.title}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {deal.value_monetary && (
                      <div>
                        <p className="text-xs text-muted-foreground">Valor Monetário</p>
                        <p className="text-sm font-medium">
                          R$ {deal.value_monetary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    {deal.value_barter && (
                      <div>
                        <p className="text-xs text-muted-foreground">Valor Permuta</p>
                        <p className="text-sm font-medium">
                          R$ {deal.value_barter.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                    {tier && (
                      <div>
                        <p className="text-xs text-muted-foreground">Cota</p>
                        <p className="text-sm font-medium">{tier.name}</p>
                      </div>
                    )}
                    {deal.expected_close_date && (
                      <div>
                        <p className="text-xs text-muted-foreground">Fechamento</p>
                        <p className="text-sm font-medium">
                          {new Date(deal.expected_close_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {dealTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dealTags.map((dt: any) => {
                        const tagColor = dt.tags?.color || '#gray'
                        const textColor = getTextColorForBackground(tagColor)
                        return (
                          <span
                            key={dt.id}
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              textColor === 'white' ? 'text-white' : 'text-gray-900'
                            }`}
                            style={{
                              backgroundColor: tagColor,
                            }}
                          >
                            {dt.tags?.name}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/deals/${deal.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Link href="/kanban">
                      <Button variant="outline">
                        Ver no Pipeline
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum deal cadastrado ainda.</p>
            <Link href="/deals/new">
              <Button>Criar primeiro deal</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

