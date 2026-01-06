'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Organization, Event, PipelineStage, SponsorshipTier, DealType, Sector } from '@/types'
import { STANDS, type StandCode } from '@/lib/expo/stands'
import { StandsMultiSelect } from '@/components/ui/multi-select-stands'

export default function NewDealPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [tiers, setTiers] = useState<SponsorshipTier[]>([])
  const [sectors, setSectors] = useState<Sector[]>([])
  const [sectorSearch, setSectorSearch] = useState('')
  const [showNewOrgDialog, setShowNewOrgDialog] = useState(false)
  const [creatingOrg, setCreatingOrg] = useState(false)
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    website: '',
    sector_ids: [] as string[],
  })
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

  useEffect(() => {
    // Carregar dados
    Promise.all([
      fetch('/api/organizations').then((r) => r.json()),
      fetch('/api/events').then((r) => r.json()),
      fetch('/api/pipeline-stages').then((r) => r.json()),
      fetch('/api/sponsorship-tiers').then((r) => r.json()),
      fetch('/api/sectors').then((r) => r.json()),
    ]).then(([orgs, evts, stgs, trs, scts]) => {
      setOrganizations(orgs)
      setEvents(evts)
      setStages(stgs)
      setTiers(trs)
      setSectors(scts)
      // Definir primeiro estágio como padrão
      if (stgs.length > 0) {
        setFormData((prev) => ({ ...prev, stage_id: stgs[0].id }))
      }
    })
  }, [])

  const handleCreateOrganization = async () => {
    if (!newOrgData.name.trim()) {
      setError('Por favor, informe o nome da empresa')
      return
    }

    setCreatingOrg(true)
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newOrgData,
          website: newOrgData.website || null,
          sector_ids: newOrgData.sector_ids || [],
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Erro ao criar empresa. Tente novamente.'
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          if (response.status === 400) {
            errorMessage = 'Dados inválidos. Verifique os campos preenchidos.'
          }
        }
        setError(errorMessage)
        setCreatingOrg(false)
        return
      }

      const newOrg = await response.json()
      
      // Atualizar lista de organizações
      const updatedOrgs = await fetch('/api/organizations').then((r) => r.json())
      setOrganizations(updatedOrgs)
      
      // Selecionar a nova empresa automaticamente
      setFormData((prev) => ({ ...prev, organization_id: newOrg.id }))
      
      // Limpar e fechar o dialog
      setSectorSearch('')
      setNewOrgData({
        name: '',
        website: '',
        sector_ids: [],
      })
      setShowNewOrgDialog(false)
      setError(null) // Limpar erro ao sucesso
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.')
      } else {
        setError(error.message || 'Erro inesperado ao criar empresa. Tente novamente.')
      }
    } finally {
      setCreatingOrg(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validação básica no frontend
    if (!formData.organization_id) {
      setError('Por favor, selecione uma empresa')
      return
    }

    if (!formData.event_id) {
      setError('Por favor, selecione um evento')
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          title: formData.title || null,
          organization_id: formData.organization_id,
          event_id: formData.event_id,
          stage_id: formData.stage_id || null,
          sponsorship_tier_id: formData.sponsorship_tier_id || null,
          type: formData.type || null,
          value_monetary: formData.value_monetary ? parseFloat(formData.value_monetary) : null,
          value_barter: formData.value_barter ? parseFloat(formData.value_barter) : null,
          barter_description: formData.barter_description || null,
          stand_location: formData.stand_location || null,
          expected_close_date: formData.expected_close_date || null,
        }),
      })

      if (!response.ok) {
        // Tentar obter mensagem de erro específica da API
        let errorMessage = 'Erro ao criar deal. Tente novamente.'
        try {
          const errorData = await response.json()
          if (errorData.error) {
            errorMessage = errorData.error
          }
        } catch {
          // Se não conseguir parsear JSON, usar mensagem padrão baseada no status
          if (response.status === 400) {
            errorMessage = 'Dados inválidos. Verifique os campos preenchidos.'
          } else if (response.status === 500) {
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.'
          }
        }
        setError(errorMessage)
        setLoading(false)
        return
      }

      const deal = await response.json()
      
      // Salvar stands se houver selecionados
      if (selectedStands.length > 0) {
        for (const stand of selectedStands) {
          try {
            await fetch(`/api/deals/${deal.id}/stands`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stand_code: stand }),
            })
          } catch (error) {
            console.error(`Erro ao adicionar stand ${stand}:`, error)
          }
        }
      }
      
      router.push(`/deals/${deal.id}`)
      router.refresh()
    } catch (error: any) {
      console.error('Erro ao criar deal:', error)
      
      // Tratamento de erros de rede
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.')
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('Erro inesperado ao criar deal. Tente novamente.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Novo Deal</CardTitle>
          <CardDescription>
            Crie uma nova oportunidade de negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-4 border border-destructive/20">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="organization_id">Empresa *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewOrgDialog(true)}
                  className="h-7 text-xs"
                >
                  + Nova Empresa
                </Button>
              </div>
              <Select
                value={formData.organization_id || undefined}
                onValueChange={(value) => setFormData({ ...formData, organization_id: value })}
              >
                <SelectTrigger id="organization_id" className="h-10">
                  <SelectValue placeholder="Selecione..." />
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

            <div>
              <Label htmlFor="title">Observações</Label>
              <Textarea
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Adicione observações sobre este deal..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div>
              <Label htmlFor="type">Tipo de Relacionamento</Label>
              <Select
                value={formData.type || undefined}
                onValueChange={(value) => setFormData({ ...formData, type: value as DealType })}
              >
                <SelectTrigger id="type" className="h-10">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patrocinador">Patrocinador</SelectItem>
                  <SelectItem value="parceiro">Parceiro</SelectItem>
                  <SelectItem value="expositor">Expositor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="event_id">Evento *</Label>
              <select
                id="event_id"
                value={formData.event_id}
                onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="stage_id">Estágio</Label>
              <select
                id="stage_id"
                value={formData.stage_id}
                onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="sponsorship_tier_id">Cota de Patrocínio</Label>
              <select
                id="sponsorship_tier_id"
                value={formData.sponsorship_tier_id}
                onChange={(e) => setFormData({ ...formData, sponsorship_tier_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione...</option>
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} - R$ {tier.value_brl.toLocaleString('pt-BR')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="value_monetary">Valor Monetário (R$)</Label>
              <Input
                id="value_monetary"
                type="number"
                step="0.01"
                value={formData.value_monetary}
                onChange={(e) => setFormData({ ...formData, value_monetary: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="value_barter">Valor em Permuta (R$)</Label>
              <Input
                id="value_barter"
                type="number"
                step="0.01"
                value={formData.value_barter}
                onChange={(e) => setFormData({ ...formData, value_barter: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="barter_description">Descrição da Permuta</Label>
              <Input
                id="barter_description"
                value={formData.barter_description}
                onChange={(e) => setFormData({ ...formData, barter_description: e.target.value })}
                placeholder="Produtos ou serviços em permuta"
              />
            </div>

            <div>
              <Label htmlFor="stands">Stands</Label>
              <StandsMultiSelect
                id="stands"
                selected={selectedStands}
                onChange={setSelectedStands}
                placeholder="Selecione os stands..."
              />
            </div>

            <div>
              <Label htmlFor="expected_close_date">Data Esperada de Fechamento</Label>
              <Input
                id="expected_close_date"
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dialog para criar nova empresa */}
      <Dialog 
        open={showNewOrgDialog} 
        onOpenChange={(open) => {
          setShowNewOrgDialog(open)
          if (!open) {
            setSectorSearch('')
            setError(null) // Limpar erro ao fechar dialog
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Empresa</DialogTitle>
            <DialogDescription>
              Adicione uma nova empresa rapidamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new_org_name">Nome *</Label>
              <Input
                id="new_org_name"
                value={newOrgData.name}
                onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                placeholder="Nome da empresa"
                required
              />
            </div>

            <div>
              <Label htmlFor="new_org_website">Website</Label>
              <Input
                id="new_org_website"
                type="url"
                value={newOrgData.website}
                onChange={(e) => setNewOrgData({ ...newOrgData, website: e.target.value })}
                placeholder="https://exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="new_org_sectors">Setores</Label>
              <Input
                id="sector_search"
                value={sectorSearch}
                onChange={(e) => setSectorSearch(e.target.value)}
                placeholder="Buscar setores..."
                className="mt-2"
              />
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {sectors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum setor cadastrado</p>
                ) : (
                  sectors
                    .filter((sector) =>
                      sector.name.toLowerCase().includes(sectorSearch.toLowerCase())
                    )
                    .map((sector) => (
                      <label
                        key={sector.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={newOrgData.sector_ids.includes(sector.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewOrgData({
                                ...newOrgData,
                                sector_ids: [...newOrgData.sector_ids, sector.id],
                              })
                            } else {
                              setNewOrgData({
                                ...newOrgData,
                                sector_ids: newOrgData.sector_ids.filter((id) => id !== sector.id),
                              })
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{sector.name}</span>
                      </label>
                    ))
                )}
              </div>
              {newOrgData.sector_ids.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {newOrgData.sector_ids.length} setor(es) selecionado(s)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNewOrgDialog(false)
                setSectorSearch('')
                setNewOrgData({
                  name: '',
                  website: '',
                  sector_ids: [],
                })
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreateOrganization} disabled={creatingOrg}>
              {creatingOrg ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


