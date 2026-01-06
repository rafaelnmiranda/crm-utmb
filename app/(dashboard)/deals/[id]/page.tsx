import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import DealTagsManager from './components/DealTagsManager'
import DeleteDealButton from './components/DeleteDealButton'
import DealActivityCenter from './components/DealActivityCenter'
import DealCounterpartsManager from './components/DealCounterpartsManager'
import { getTextColorForBackground } from '@/lib/utils'
import type { Deal } from '@/types'

export default async function DealDetailPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuth()
  const supabase = createServerClient()
  
  const { data: deal, error } = await supabase
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
      ),
      deal_stands (*)
    `)
    .eq('id', params.id)
    .single()

  if (error || !deal) {
    notFound()
  }

  const organization = (deal as any).organizations
  const stage = (deal as any).pipeline_stages
  const event = (deal as any).events
  const tier = (deal as any).sponsorship_tiers
  const dealTags = (deal as any).deal_tags || []
  const dealStands = (deal as any).deal_stands || []
  
  // Se não houver stands na nova tabela, verificar stand_location antigo para compatibilidade
  const stands = dealStands.length > 0 
    ? dealStands.map((ds: { stand_code: string }) => ds.stand_code).sort()
    : deal.stand_location 
      ? [deal.stand_location]
      : []

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/kanban">
          <Button variant="outline">← Voltar</Button>
        </Link>
      </div>

      <Card className="mb-6 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {organization ? organization.name : 'Sem empresa'}
              </CardTitle>
              <CardDescription>
                {deal.type && (
                  <span className="block mt-2">
                    <span className="inline-block rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                      {deal.type}
                    </span>
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href={`/deals/${params.id}/edit`}>
                <Button variant="outline">Editar</Button>
              </Link>
              <DeleteDealButton 
                dealId={params.id} 
                dealName={organization ? organization.name : 'Sem empresa'}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {deal.title && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Observações</p>
              <p className="text-foreground whitespace-pre-wrap">{deal.title}</p>
            </div>
          )}

          {event && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Evento</p>
              <p className="text-foreground">{event.name}</p>
            </div>
          )}

          {stage && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estágio</p>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  getTextColorForBackground(stage.color) === 'white' 
                    ? 'text-white' 
                    : 'text-gray-900'
                }`}
                style={{ backgroundColor: stage.color }}
              >
                {stage.name}
              </span>
            </div>
          )}

          {tier && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Cota</p>
              <p className="text-foreground">
                {tier.name} - R$ {tier.value_brl.toLocaleString('pt-BR')}
              </p>
            </div>
          )}

          {deal.value_monetary && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Monetário</p>
              <p className="text-foreground">
                R$ {deal.value_monetary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {deal.value_barter && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor em Permuta</p>
              <p className="text-foreground">
                R$ {deal.value_barter.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {deal.barter_description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Descrição da Permuta</p>
              <p className="text-foreground">{deal.barter_description}</p>
            </div>
          )}

          {stands.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stands</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {stands.map((stand: string) => (
                  <span
                    key={stand}
                    className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium"
                  >
                    {stand}
                  </span>
                ))}
              </div>
            </div>
          )}

          {deal.expected_close_date && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Esperada de Fechamento</p>
              <p className="text-foreground">
                {new Date(deal.expected_close_date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}

          <div>
            <DealTagsManager dealId={params.id} initialTags={dealTags} />
          </div>

          <div className="pt-4 border-t border-border">
            <DealCounterpartsManager dealId={params.id} />
          </div>
        </CardContent>
      </Card>

      <DealActivityCenter dealId={params.id} />
    </div>
  )
}


