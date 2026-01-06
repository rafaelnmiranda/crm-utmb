'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Deal, Organization, Event, PipelineStage, SponsorshipTier, DealType } from '@/types'
import { STANDS, type StandCode } from '@/lib/expo/stands'
import { StandsMultiSelect } from '@/components/ui/multi-select-stands'

type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task'
type ActivityRow = {
  id: string
  deal_id: string
  type: ActivityType
  title: string | null
  description: string | null
  activity_date: string
  next_action?: string | null
  next_action_date?: string | null
  completed: boolean
  created_at: string
}

interface DealEditModalProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  organizations: Organization[]
  events: Event[]
  stages: PipelineStage[]
  tiers: SponsorshipTier[]
  onSuccess?: () => void
}

export default function DealEditModal({
  deal,
  open,
  onOpenChange,
  organizations,
  events,
  stages,
  tiers,
  onSuccess,
}: DealEditModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [formData, setFormData] = useState({
    title: '',
    organization_id: '',
    event_id: '',
    stage_id: '',
    sponsorship_tier_id: '',
    type: '' as DealType | '',
    value_monetary: '',
    value_barter: '',
    barter_description: '',
    stand_location: '' as StandCode | '',
    expected_close_date: '',
  })
  const [selectedStands, setSelectedStands] = useState<StandCode[]>([])

  // Carregar dados do deal quando o modal abrir
  useEffect(() => {
    if (deal && open) {
      setFormData({
        title: deal.title || '',
        organization_id: deal.organization_id || '',
        event_id: deal.event_id || '',
        stage_id: deal.stage_id || '',
        sponsorship_tier_id: deal.sponsorship_tier_id || '',
        type: deal.type || '',
        value_monetary: deal.value_monetary?.toString() || '',
        value_barter: deal.value_barter?.toString() || '',
        barter_description: deal.barter_description || '',
        stand_location: (deal.stand_location as StandCode | null) || '',
        expected_close_date: deal.expected_close_date
          ? new Date(deal.expected_close_date).toISOString().split('T')[0]
          : '',
      })
      
      // Carregar stands do deal
      loadDealStands(deal.id)
    }
  }, [deal, open])

  // Carregar stands do deal
  const loadDealStands = async (dealId: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}/stands`)
      if (response.ok) {
        const data = await response.json()
        const standCodes = data.map((ds: { stand_code: StandCode }) => ds.stand_code)
        setSelectedStands(standCodes)
      } else {
        // Se não houver stands na nova tabela, verificar stand_location antigo
        const response = await fetch(`/api/deals/${dealId}`)
        if (response.ok) {
          const dealData = await response.json()
          if (dealData.stand_location) {
            setSelectedStands([dealData.stand_location as StandCode])
          } else {
            setSelectedStands([])
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar stands:', error)
      setSelectedStands([])
    }
  }

  // Reset do painel de histórico quando fechar/abrir
  useEffect(() => {
    if (!open) {
      setShowHistory(false)
      setHistoryError(null)
      setActivities([])
      setHistoryLoading(false)
      setSelectedStands([])
    }
  }, [open])

  const loadHistory = async () => {
    if (!deal) return
    setHistoryLoading(true)
    setHistoryError(null)
    try {
      const res = await fetch(`/api/activities?deal_id=${encodeURIComponent(deal.id)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Falha ao carregar histórico')
      const data = (await res.json()) as ActivityRow[]
      setActivities(data || [])
    } catch (e: any) {
      setHistoryError(e.message || 'Erro ao carregar histórico')
    } finally {
      setHistoryLoading(false)
    }
  }

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString('pt-BR')
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deal) return

    if (!formData.organization_id) {
      alert('Por favor, selecione uma empresa')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/deals/${deal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title || null,
          organization_id: formData.organization_id,
          event_id: formData.event_id,
          stage_id: formData.stage_id || null,
          sponsorship_tier_id: formData.sponsorship_tier_id && formData.sponsorship_tier_id !== '__none__' ? formData.sponsorship_tier_id : null,
          type: formData.type || null,
          value_monetary: formData.value_monetary ? parseFloat(formData.value_monetary) : null,
          value_barter: formData.value_barter ? parseFloat(formData.value_barter) : null,
          barter_description: formData.barter_description || null,
          stand_location: formData.stand_location || null,
          expected_close_date: formData.expected_close_date || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar deal')
      }

      // Atualizar stands
      await updateDealStands(deal.id, selectedStands)

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao atualizar deal. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Atualizar stands do deal
  const updateDealStands = async (dealId: string, newStands: StandCode[]) => {
    try {
      // Buscar stands atuais
      const currentResponse = await fetch(`/api/deals/${dealId}/stands`)
      const currentStands: { stand_code: StandCode }[] = currentResponse.ok ? await currentResponse.json() : []
      const currentStandCodes = currentStands.map((ds) => ds.stand_code)

      // Encontrar stands para adicionar e remover
      const toAdd = newStands.filter((stand) => !currentStandCodes.includes(stand))
      const toRemove = currentStandCodes.filter((stand) => !newStands.includes(stand))

      // Adicionar novos stands
      for (const stand of toAdd) {
        const addResponse = await fetch(`/api/deals/${dealId}/stands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stand_code: stand }),
        })
        if (!addResponse.ok) {
          const error = await addResponse.json()
          console.error(`Erro ao adicionar stand ${stand}:`, error)
        }
      }

      // Remover stands
      for (const stand of toRemove) {
        const deleteResponse = await fetch(`/api/deals/${dealId}/stands?stand_code=${stand}`, {
          method: 'DELETE',
        })
        if (!deleteResponse.ok) {
          console.error(`Erro ao remover stand ${stand}`)
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar stands:', error)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!deal) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="text-2xl font-bold">Editar Deal</DialogTitle>
              <DialogDescription>
                Atualize as informações do deal. Todas as alterações serão salvas permanentemente.
              </DialogDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const next = !showHistory
                  setShowHistory(next)
                  if (next) await loadHistory()
                }}
              >
                {showHistory ? 'Ocultar histórico' : 'Ver histórico'}
              </Button>
              <Link href={`/deals/${deal.id}`}>
                <Button type="button" variant="outline">Abrir Deal</Button>
              </Link>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organization_id" className="text-sm font-medium">
                  Empresa *
                </Label>
                <Select
                  value={formData.organization_id || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, organization_id: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_id" className="text-sm font-medium">
                  Evento *
                </Label>
                <Select
                  value={formData.event_id}
                  onValueChange={(value) => setFormData({ ...formData, event_id: value })}
                  required
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione um evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Observações
              </Label>
              <Textarea
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Adicione observações sobre este deal..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Tipo de Relacionamento
              </Label>
              <Select
                value={formData.type || undefined}
                onValueChange={(value) => setFormData({ ...formData, type: value as DealType })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patrocinador">Patrocinador</SelectItem>
                  <SelectItem value="parceiro">Parceiro</SelectItem>
                  <SelectItem value="expositor">Expositor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stage_id" className="text-sm font-medium">
                  Estágio
                </Label>
                <Select
                  value={formData.stage_id}
                  onValueChange={(value) => setFormData({ ...formData, stage_id: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione um estágio" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: stage.color }}
                          />
                          {stage.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsorship_tier_id" className="text-sm font-medium">
                  Cota de Patrocínio
                </Label>
                <Select
                  value={formData.sponsorship_tier_id || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sponsorship_tier_id: value === '__none__' ? '' : value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione uma cota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.name} - R$ {tier.value_brl.toLocaleString('pt-BR')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value_monetary" className="text-sm font-medium">
                  Valor Monetário (R$)
                </Label>
                <Input
                  id="value_monetary"
                  type="number"
                  step="0.01"
                  value={formData.value_monetary}
                  onChange={(e) => setFormData({ ...formData, value_monetary: e.target.value })}
                  placeholder="0.00"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value_barter" className="text-sm font-medium">
                  Valor em Permuta (R$)
                </Label>
                <Input
                  id="value_barter"
                  type="number"
                  step="0.01"
                  value={formData.value_barter}
                  onChange={(e) => setFormData({ ...formData, value_barter: e.target.value })}
                  placeholder="0.00"
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barter_description" className="text-sm font-medium">
                Descrição da Permuta
              </Label>
              <Textarea
                id="barter_description"
                value={formData.barter_description}
                onChange={(e) =>
                  setFormData({ ...formData, barter_description: e.target.value })
                }
                placeholder="Produtos ou serviços em permuta"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stands" className="text-sm font-medium">
                  Stands
                </Label>
                <StandsMultiSelect
                  id="stands"
                  selected={selectedStands}
                  onChange={setSelectedStands}
                  placeholder="Selecione os stands..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_close_date" className="text-sm font-medium">
                  Data Esperada de Fechamento
                </Label>
                <Input
                  id="expected_close_date"
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expected_close_date: e.target.value })
                  }
                  className="h-11"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>

        {showHistory && (
          <div className="mt-2 border-t border-border pt-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">Histórico / Próximas tarefas</h3>
              <Button type="button" variant="outline" onClick={loadHistory} disabled={historyLoading}>
                {historyLoading ? 'Atualizando…' : 'Atualizar'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Deal: <span className="font-mono">{deal.id}</span> • Itens carregados: {activities.length}
            </p>

            {historyError && <p className="text-sm text-red-600">{historyError}</p>}

            {historyLoading ? (
              <p className="text-sm text-muted-foreground">Carregando…</p>
            ) : (
              <>
                {/* Tarefas abertas */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Tarefas abertas</p>
                  {activities.filter((a) => (a.type === 'task' && !a.completed) || (!!a.next_action && !a.completed)).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma tarefa aberta.</p>
                  ) : (
                    <div className="space-y-2">
                      {activities
                        .filter((a) => (a.type === 'task' && !a.completed) || (!!a.next_action && !a.completed))
                        .sort((a, b) => {
                          const aDue = new Date((a.next_action_date as any) || a.activity_date).getTime()
                          const bDue = new Date((b.next_action_date as any) || b.activity_date).getTime()
                          return aDue - bDue
                        })
                        .slice(0, 5)
                        .map((t) => (
                          <div key={t.id} className="rounded-md border border-border p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium truncate">{t.title || t.next_action || 'Tarefa'}</p>
                              <p className="text-xs text-muted-foreground">
                                Vence {formatDate((t.next_action_date as any) || t.activity_date)}
                              </p>
                            </div>
                            {t.description && (
                              <p className="mt-2 text-sm whitespace-pre-wrap">{t.description}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Tarefas concluídas recentes */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Tarefas concluídas (recentes)</p>
                  {activities.filter((a) => a.type === 'task' && a.completed).length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma tarefa concluída recente.</p>
                  ) : (
                    <div className="space-y-2">
                      {activities
                        .filter((a) => a.type === 'task' && a.completed)
                        .slice(0, 5)
                        .map((t) => (
                          <div key={t.id} className="rounded-md border border-border p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium truncate">{t.title || 'Tarefa'}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(t.activity_date)}
                              </p>
                            </div>
                            {t.description && (
                              <p className="mt-2 text-sm whitespace-pre-wrap">{t.description}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Últimas interações */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Últimas interações</p>
                  {activities.filter((a) => a.type !== 'task').length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sem histórico ainda.</p>
                  ) : (
                    <div className="space-y-2">
                      {activities
                        .filter((a) => a.type !== 'task')
                        .slice(0, 5)
                        .map((a) => (
                          <div key={a.id} className="rounded-md border border-border p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium">
                                {a.title ? `${a.title} (${a.type})` : `Atividade: ${a.type}`}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDateTime(a.activity_date)}</p>
                            </div>
                            {a.description && (
                              <p className="mt-2 text-sm whitespace-pre-wrap">{a.description}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Link href={`/deals/${deal.id}`}>
                      <Button type="button">Abrir histórico completo</Button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

