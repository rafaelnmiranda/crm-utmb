'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { SponsorshipCounterpart, SponsorshipTier } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface TierLink {
  id: string
  tier_id: string
  counterpart_id: string
  included: boolean
  tier_details: string | null
  tier: SponsorshipTier | null
}

export default function EditCounterpartPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    details: '',
  })
  const [tierLinks, setTierLinks] = useState<TierLink[]>([])
  const [tiers, setTiers] = useState<SponsorshipTier[]>([])
  const [selectedTierId, setSelectedTierId] = useState<string>('')
  const [addingTierLink, setAddingTierLink] = useState(false)
  const [removingTierLink, setRemovingTierLink] = useState<string | null>(null)

  const fetchTiers = useCallback(async () => {
    try {
      const response = await fetch('/api/sponsorship-tiers')
      if (!response.ok) throw new Error('Erro ao carregar cotas')
      const data = await response.json()
      setTiers(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const [counterpartRes, linksRes] = await Promise.all([
        fetch(`/api/sponsorship-counterparts/${id}`),
        fetch(`/api/sponsorship-counterparts/${id}/tier-links`),
      ])

      if (!counterpartRes.ok) {
        if (counterpartRes.status === 404) {
          alert('Entregável não encontrado')
          router.push('/settings/sponsorship-counterparts')
          return
        }
        throw new Error('Erro ao buscar entregável')
      }

      const counterpart: SponsorshipCounterpart = await counterpartRes.json()
      const links: TierLink[] = await linksRes.json()

      setFormData({
        name: counterpart.name,
        details: counterpart.details || '',
      })
      setTierLinks(links)
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao carregar entregável')
      router.push('/settings/sponsorship-counterparts')
    } finally {
      setLoadingData(false)
    }
  }, [id, router])

  useEffect(() => {
    fetchData()
    fetchTiers()
  }, [fetchData, fetchTiers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/sponsorship-counterparts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar entregável')
      }

      router.push('/settings/sponsorship-counterparts')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Erro ao atualizar entregável. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTierLink = async () => {
    if (!selectedTierId) {
      alert('Por favor, selecione uma cota')
      return
    }

    // Verificar se já existe vínculo
    if (tierLinks.some(link => link.tier_id === selectedTierId)) {
      alert('Este entregável já está vinculado a esta cota')
      return
    }

    setAddingTierLink(true)
    try {
      const response = await fetch(`/api/sponsorship-tiers/${selectedTierId}/counterparts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          counterpart_id: id,
          included: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao vincular cota')
      }

      await fetchData()
      setSelectedTierId('')
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Erro ao vincular cota. Tente novamente.')
    } finally {
      setAddingTierLink(false)
    }
  }

  const handleRemoveTierLink = async (tierId: string) => {
    setRemovingTierLink(tierId)
    try {
      const response = await fetch(`/api/sponsorship-counterparts/${id}/tier-links?tier_id=${tierId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao remover vínculo')
      }

      await fetchData()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Erro ao remover vínculo. Tente novamente.')
    } finally {
      setRemovingTierLink(null)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/sponsorship-counterparts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir entregável')
      }

      router.push('/settings/sponsorship-counterparts')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Erro ao excluir entregável. Tente novamente.')
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loadingData) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const availableTiers = tiers.filter(tier => !tierLinks.some(link => link.tier_id === tier.id))

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/settings/sponsorship-counterparts" 
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Voltar para Entregáveis
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Editar Entregável
          </h1>
        </div>

        <div className="space-y-6">
          {/* Form Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Informações do Entregável</CardTitle>
              <CardDescription>
                Edite as informações do entregável
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Nome do entregável"
                  />
                </div>

                <div>
                  <Label htmlFor="details">Descrição Base (opcional)</Label>
                  <Textarea
                    id="details"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Descrição geral do entregável"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Esta descrição será compartilhada entre todas as cotas que usam este entregável
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex-1"
                  >
                    Excluir
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tier Links Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Vínculos com Cotas</CardTitle>
              <CardDescription>
                Gerencie em quais cotas este entregável está disponível
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Tier Link */}
              {availableTiers.length > 0 && (
                <div className="p-4 border border-border rounded-lg bg-muted/50 space-y-3">
                  <div>
                    <Label htmlFor="tier_select">Adicionar a uma Cota</Label>
                    <Select
                      value={selectedTierId}
                      onValueChange={setSelectedTierId}
                    >
                      <SelectTrigger id="tier_select" className="mt-2">
                        <SelectValue placeholder="Selecione uma cota..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTiers.map((tier) => (
                          <SelectItem key={tier.id} value={tier.id}>
                            {tier.name} - R$ {tier.value_brl.toLocaleString('pt-BR')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddTierLink}
                    disabled={!selectedTierId || addingTierLink}
                    size="sm"
                  >
                    {addingTierLink ? 'Adicionando...' : 'Adicionar à Cota'}
                  </Button>
                </div>
              )}

              {/* Tier Links List */}
              {tierLinks.length > 0 ? (
                <div className="space-y-2">
                  {tierLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between gap-4 p-3 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{link.tier?.name || 'Cota desconhecida'}</div>
                        {link.tier && (
                          <div className="text-sm text-muted-foreground">
                            R$ {link.tier.value_brl.toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja remover o vínculo com a cota "${link.tier?.name}"?`)) {
                            handleRemoveTierLink(link.tier_id)
                          }
                        }}
                        disabled={removingTierLink === link.tier_id}
                      >
                        {removingTierLink === link.tier_id ? 'Removendo...' : 'Remover'}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum vínculo com cotas. Adicione um vínculo acima.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Entregável</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o entregável &quot;{formData.name}&quot;? 
              {tierLinks.length > 0 && (
                <>
                  <br /><br />
                  <strong>Atenção:</strong> Este entregável está vinculado a {tierLinks.length} cota(s). 
                  Você precisa remover todos os vínculos antes de poder excluí-lo.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || tierLinks.length > 0}
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
