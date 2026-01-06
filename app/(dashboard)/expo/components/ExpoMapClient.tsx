'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Deal, Event, Organization, PipelineStage } from '@/types'
import { cn, getTextColorForBackground } from '@/lib/utils'
import { STANDS, STAND_COORDS, OFFICIAL_STORE_STAND, type StandCode } from '@/lib/expo/stands'

type DealStand = {
  id: string
  deal_id: string
  stand_code: StandCode
  created_at: string
}

type DealWithRelations = Deal & {
  organizations?: Organization | null
  pipeline_stages?: PipelineStage | null
  events?: Event | null
  deal_stands?: DealStand[]
}

function dealLabel(deal: DealWithRelations) {
  const orgName = deal.organizations?.name || 'Sem empresa'
  const stageName = deal.pipeline_stages?.name ? ` — ${deal.pipeline_stages.name}` : ''
  const stands = deal.deal_stands && deal.deal_stands.length > 0
    ? ` (${deal.deal_stands.map(s => s.stand_code).join(', ')})`
    : deal.stand_location ? ` (${deal.stand_location})` : ''
  return `${orgName}${stageName}${stands}`
}

export default function ExpoMapClient({
  events,
  activeEventId,
  initialDeals,
}: {
  events: Event[]
  activeEventId: string
  initialDeals: DealWithRelations[]
}) {
  const router = useRouter()
  const [deals, setDeals] = useState<DealWithRelations[]>(initialDeals)
  const [selectedStand, setSelectedStand] = useState<StandCode | null>(null)
  const [selectedDealId, setSelectedDealId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const standsByCode = useMemo(() => {
    const map = new Map<StandCode, DealWithRelations>()
    for (const d of deals) {
      // First, check deal_stands (new structure)
      if (d.deal_stands && d.deal_stands.length > 0) {
        for (const ds of d.deal_stands) {
          map.set(ds.stand_code, d)
        }
      }
      // Also check stand_location for backward compatibility
      // This ensures old data (like YOPP) is still displayed
      if (d.stand_location) {
        const code = d.stand_location as StandCode
        // Only set if not already in map (deal_stands takes priority)
        if (!map.has(code)) {
          map.set(code, d)
        }
      }
    }
    return map
  }, [deals])

  const expositorDeals = useMemo(() => {
    // Mostrar todos os deals do evento atual para permitir atribuição de stands
    // Priorizar deals do tipo 'expositor', mas incluir todos para flexibilidade
    return deals
  }, [deals])

  const selectedStandDeal = selectedStand ? standsByCode.get(selectedStand) : undefined

  // Estatísticas dos stands
  const stats = useMemo(() => {
    const total = STANDS.length
    const totalOccupied = Array.from(standsByCode.values()).length
    const officialStore = standsByCode.has(OFFICIAL_STORE_STAND) ? 1 : 0
    const occupiedExcludingOfficial = totalOccupied - officialStore
    // E1 não conta como disponível (sempre é Loja Oficial)
    const available = total - totalOccupied
    const occupancyRate = total > 0 ? Math.round((totalOccupied / total) * 100) : 0

    // Contar empresas/marcas distintas na EXPO
    // Inclui todas as organizações dos deals com stands + Loja Oficial (se E01 estiver ocupado)
    const uniqueOrganizations = new Set<string>()
    const dealsWithStands = Array.from(standsByCode.values())
    const e01Deal = standsByCode.get(OFFICIAL_STORE_STAND)
    
    for (const deal of dealsWithStands) {
      // Se o deal tem organização e não é o deal do E01, adiciona ao conjunto
      // E01 será contado separadamente como "Loja Oficial"
      if (deal.organizations?.id && deal !== e01Deal) {
        uniqueOrganizations.add(deal.organizations.id)
      }
    }
    
    // Se E01 está ocupado, conta "Loja Oficial" como uma marca separada
    const distinctBrands = uniqueOrganizations.size + (officialStore > 0 ? 1 : 0)

    return {
      total,
      available,
      occupied: occupiedExcludingOfficial,
      officialStore,
      occupancyRate,
      totalOccupied,
      distinctBrands,
    }
  }, [standsByCode])

  const addStandToDeal = async (dealId: string, stand: StandCode): Promise<boolean> => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/deals/${dealId}/stands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stand_code: stand }),
      })
      const payload = await response.json().catch(() => ({}))
      
      if (!response.ok) {
        throw new Error(payload?.error || 'Erro ao adicionar stand')
      }

      // Update local state
      setDeals((prev) => {
        return prev.map((d) => {
          if (d.id === dealId) {
            const existingStands = d.deal_stands || []
            return {
              ...d,
              deal_stands: [...existingStands, { id: payload.id, deal_id: dealId, stand_code: stand, created_at: payload.created_at }],
            }
          }
          return d
        })
      })
      
      router.refresh()
      return true
    } catch (e: any) {
      setError(e?.message || 'Erro ao adicionar stand')
      return false
    } finally {
      setSaving(false)
    }
  }

  const removeStandFromDeal = async (dealId: string, stand: StandCode): Promise<boolean> => {
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/deals/${dealId}/stands?stand_code=${stand}`, {
        method: 'DELETE',
      })
      const payload = await response.json().catch(() => ({}))
      
      if (!response.ok) {
        throw new Error(payload?.error || 'Erro ao remover stand')
      }

      // Update local state
      setDeals((prev) => {
        return prev.map((d) => {
          if (d.id === dealId) {
            return {
              ...d,
              deal_stands: (d.deal_stands || []).filter((ds) => ds.stand_code !== stand),
            }
          }
          return d
        })
      })
      
      router.refresh()
      return true
    } catch (e: any) {
      setError(e?.message || 'Erro ao remover stand')
      return false
    } finally {
      setSaving(false)
    }
  }

  const clearStand = async (stand: StandCode) => {
    const occupied = standsByCode.get(stand)
    if (!occupied) return
    
    // Check if using deal_stands or stand_location
    if (occupied.deal_stands && occupied.deal_stands.length > 0) {
      const standEntry = occupied.deal_stands.find((ds) => ds.stand_code === stand)
      if (standEntry) {
        await removeStandFromDeal(occupied.id, stand)
      }
    } else if (occupied.stand_location === stand) {
      // Legacy: use old API for backward compatibility
      const response = await fetch(`/api/deals/${occupied.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stand_location: null }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setError(payload?.error || 'Erro ao limpar stand')
      } else {
        router.refresh()
      }
    }
  }

  const assignStand = async ({
    stand,
    dealId,
    allowReplace,
  }: {
    stand: StandCode
    dealId: string
    allowReplace: boolean
  }): Promise<boolean> => {
    const occupied = standsByCode.get(stand)
    if (occupied && occupied.id !== dealId && !allowReplace) {
      setError(`O stand ${stand} já está ocupado por ${occupied.organizations?.name || 'outro deal'}.`)
      return false
    }

    setSaving(true)
    setError(null)
    try {
      // If replacing, clear the existing occupant first
      if (occupied && occupied.id !== dealId) {
        if (occupied.deal_stands && occupied.deal_stands.length > 0) {
          const standEntry = occupied.deal_stands.find((ds) => ds.stand_code === stand)
          if (standEntry) {
            await removeStandFromDeal(occupied.id, stand)
          }
        } else if (occupied.stand_location === stand) {
          // Legacy: clear old stand_location
          await fetch(`/api/deals/${occupied.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stand_location: null }),
          })
        }
      }

      // Add stand to the deal
      const success = await addStandToDeal(dealId, stand)
      return success
    } catch (e: any) {
      setError(e?.message || 'Erro ao atribuir stand')
      return false
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-hidden">
      {/* Mini Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 flex-shrink-0">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Total de Stands</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Disponíveis</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.available}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Ocupados</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.occupied}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Quantidade de Marcas</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.distinctBrands}</p>
              <p className="text-xs text-muted-foreground mt-1">Empresas na EXPO</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">Taxa de Ocupação</p>
              <p className="text-2xl font-bold text-primary mt-1">{stats.occupancyRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalOccupied} / {stats.total}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border flex-1 min-h-0 flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-lg">Mapa</CardTitle>
          <CardDescription className="flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Label className="text-xs">Evento</Label>
              <Select
                value={activeEventId}
                onValueChange={(value) => {
                  const qs = new URLSearchParams({ eventId: value })
                  router.push(`/expo?${qs.toString()}`)
                }}
              >
                <SelectTrigger className="h-9 w-[260px]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-gray-300 bg-gray-200 opacity-60"></div>
                <span>Livre</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-gray-700 bg-blue-500"></div>
                <span>Loja Oficial (E1)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-gray-700 bg-green-500"></div>
                <span>Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-200 opacity-60"></div>
                <span>Retirada de Kit</span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 p-2 md:p-4 overflow-auto">
          <div className="relative w-full mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 p-2 md:p-4" style={{ aspectRatio: '92.85/23', maxWidth: '100%' }}>
            {/* Palco - entre blocos A e D, 8x4m - com espaçamento */}
            <div className="absolute left-[28.5%] top-[2.17%] w-[8.6%] h-[17.4%] bg-red-200 rounded-lg border-2 border-red-500 flex items-center justify-center opacity-30 pointer-events-none z-0">
              <span className="text-xs font-bold text-red-900">PALCO</span>
            </div>

            {/* Retirada de Kit - área à direita das fileiras D, E e F */}
            <div className="absolute left-[90%] top-[2.17%] w-[9%] h-[93.48%] bg-green-200 rounded-lg border-2 border-green-500 flex items-center justify-center opacity-50 pointer-events-none z-0">
              <span className="text-xs md:text-sm font-bold text-green-900 text-center px-2">Retirada de Kit</span>
            </div>

            {STANDS.map((stand) => {
              const rect = STAND_COORDS[stand]
              const occupied = standsByCode.get(stand)
              const isOfficialStore = stand === OFFICIAL_STORE_STAND
              
              // Cor especial para Loja Oficial UTMB (E1)
              let bg = '#E2E8F0' // Cinza claro padrão (livre)
              if (isOfficialStore) {
                bg = '#3B82F6' // Azul para Loja Oficial
              } else if (occupied) {
                // Stand ocupado usa cor do estágio do deal
                bg = occupied.pipeline_stages?.color || '#10B981' // Verde padrão se não tiver estágio
              }
              
              const textColor = getTextColorForBackground(bg) === 'white' ? '#fff' : '#111827'
              const isSelected = selectedStand === stand
              const opacity = occupied || isOfficialStore ? 1 : 0.6

              return (
                <button
                  key={stand}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedStand(stand)
                    setSelectedDealId('')
                    setError(null)
                  }}
                  className={cn(
                    'absolute rounded border-2 transition-all flex items-center justify-center cursor-pointer',
                    isSelected 
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background z-20' 
                      : 'hover:ring-1 hover:ring-primary/50 z-10',
                    occupied || isOfficialStore ? 'border-gray-700 shadow-md' : 'border-gray-300'
                  )}
                  style={{
                    left: `${rect.xPct}%`,
                    top: `${rect.yPct}%`,
                    width: `${rect.wPct}%`,
                    height: `${rect.hPct}%`,
                    backgroundColor: bg,
                    color: textColor,
                    opacity,
                    zIndex: isSelected ? 20 : 10,
                    pointerEvents: 'auto',
                  }}
                  aria-label={`Stand ${stand}${occupied ? ` ocupado por ${occupied.organizations?.name || 'deal'}` : isOfficialStore ? ' - Loja Oficial UTMB' : ' livre'}`}
                >
                  <div className="flex flex-col items-center justify-center p-1">
                    <span className="text-[10px] md:text-xs font-bold leading-tight">{stand}</span>
                    {isOfficialStore && (
                      <span className="text-[8px] md:text-[10px] font-medium leading-tight mt-0.5">Loja Oficial</span>
                    )}
                    {occupied && !isOfficialStore && (
                      <span className="text-[8px] md:text-[10px] font-medium leading-tight mt-0.5 truncate max-w-full px-1">
                        {occupied.organizations?.name || 'Ocupado'}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog 
        open={!!selectedStand} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStand(null)
            setSelectedDealId('')
            setError(null)
          }
        }}
      >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Stand {selectedStand}</DialogTitle>
            <DialogDescription>
              {selectedStandDeal ? 'Informações do stand ocupado' : 'Stand livre - atribua um deal'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 border border-destructive/20">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}
            {selectedStandDeal ? (
              <div className="space-y-3">
                <div className="rounded-md border border-border p-3">
                  <p className="text-sm font-medium text-foreground">
                    {selectedStandDeal.organizations?.name || 'Sem empresa'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedStandDeal.pipeline_stages?.name || 'Sem estágio'}
                  </p>
                  {(selectedStandDeal.deal_stands && selectedStandDeal.deal_stands.length > 0) || selectedStandDeal.stand_location ? (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Stands atribuídos:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedStandDeal.deal_stands && selectedStandDeal.deal_stands.length > 0
                          ? selectedStandDeal.deal_stands.map((ds) => (
                              <span
                                key={ds.id}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
                                  ds.stand_code === selectedStand
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {ds.stand_code}
                                {ds.stand_code === selectedStand && (
                                  <button
                                    onClick={async () => {
                                      await removeStandFromDeal(selectedStandDeal.id, ds.stand_code)
                                    }}
                                    className="ml-1 hover:text-destructive"
                                    disabled={saving}
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            ))
                          : selectedStandDeal.stand_location && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                                {selectedStandDeal.stand_location}
                              </span>
                            )}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Link href={`/deals/${selectedStandDeal.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Abrir deal
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={saving}
                    onClick={async () => {
                      await clearStand(selectedStand!)
                      setSelectedStand(null)
                    }}
                  >
                    {saving ? '...' : 'Remover deste stand'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-border p-3">
                <p className="text-sm text-foreground font-medium">Stand livre</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione um deal e atribua este stand. Você pode atribuir múltiplos stands ao mesmo deal.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm">Atribuir stand a um deal</Label>
              <Select value={selectedDealId || undefined} onValueChange={setSelectedDealId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione um deal..." />
                </SelectTrigger>
                <SelectContent>
                  {expositorDeals.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {dealLabel(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={!selectedDealId || saving || !selectedStand}
                  onClick={async () => {
                    const success = await assignStand({ stand: selectedStand!, dealId: selectedDealId, allowReplace: false })
                    if (success) {
                      setSelectedDealId('')
                      // Don't close modal, allow adding more stands
                    }
                  }}
                >
                  {saving ? 'Salvando...' : 'Adicionar'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={!selectedDealId || saving || !selectedStand}
                  onClick={async () => {
                    const success = await assignStand({ stand: selectedStand!, dealId: selectedDealId, allowReplace: true })
                    if (success) {
                      setSelectedDealId('')
                    }
                  }}
                >
                  {saving ? '...' : 'Substituir'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                "Adicionar" adiciona este stand ao deal (pode ter múltiplos stands). "Substituir" remove o deal atual do stand (se houver) e atribui o novo.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


