'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { SponsorshipTier, SponsorshipCounterpart } from '@/types'

interface TierCounterpartItem {
  id: string
  tier_id: string
  counterpart_id: string
  included: boolean
  tier_details: string | null
  name: string
  details: string | null
  counterpart?: SponsorshipCounterpart
}

export default function EditSponsorshipTierPage() {
  const router = useRouter()
  const params = useParams()
  const tierId = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [counterparts, setCounterparts] = useState<TierCounterpartItem[]>([])
  const [loadingCounterparts, setLoadingCounterparts] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCounterpart, setNewCounterpart] = useState({ name: '', details: '', included: true, tier_details: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    value_brl: '',
    description: '',
  })

  const fetchCounterparts = useCallback(async () => {
    try {
      const response = await fetch(`/api/sponsorship-tiers/${tierId}/counterparts`)
      if (!response.ok) {
        throw new Error('Erro ao carregar entregáveis')
      }
      const data = await response.json()
      setCounterparts(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingCounterparts(false)
    }
  }, [tierId])

  const fetchTier = useCallback(async () => {
    try {
      const response = await fetch(`/api/sponsorship-tiers/${tierId}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar cota')
      }
      const tier: SponsorshipTier = await response.json()
      setFormData({
        name: tier.name || '',
        value_brl: tier.value_brl?.toString() || '',
        description: tier.description || '',
      })
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao carregar cota. Tente novamente.')
      router.push('/settings/sponsorship-tiers')
    } finally {
      setLoadingData(false)
    }
  }, [tierId, router])

  useEffect(() => {
    if (tierId) {
      fetchTier()
      fetchCounterparts()
    }
  }, [tierId, fetchTier, fetchCounterparts])

  const handleSaveCounterpart = async (counterpart: TierCounterpartItem) => {
    try {
      const response = await fetch(
        `/api/sponsorship-tiers/${tierId}/counterparts/${counterpart.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            included: counterpart.included,
            tier_details: counterpart.tier_details,
          }),
        }
      )
      if (!response.ok) throw new Error('Erro ao salvar')
      await fetchCounterparts()
      setEditingId(null)
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao salvar entregável')
    }
  }

  const handleDeleteCounterpart = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este entregável?')) return
    try {
      const response = await fetch(
        `/api/sponsorship-tiers/${tierId}/counterparts/${id}`,
        { method: 'DELETE' }
      )
      if (!response.ok) throw new Error('Erro ao remover')
      await fetchCounterparts()
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao remover entregável')
    }
  }

  const handleAddCounterpart = async () => {
    if (!newCounterpart.name.trim()) {
      alert('Por favor, informe o nome do entregável')
      return
    }
    try {
      const response = await fetch(
        `/api/sponsorship-tiers/${tierId}/counterparts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newCounterpart.name,
            details: newCounterpart.details,
            included: newCounterpart.included,
            tier_details: newCounterpart.tier_details || null,
          }),
        }
      )
      if (!response.ok) throw new Error('Erro ao adicionar')
      await fetchCounterparts()
      setNewCounterpart({ name: '', details: '', included: true, tier_details: '' })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao adicionar entregável')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Por favor, informe o nome da cota')
      return
    }

    if (!formData.value_brl || parseFloat(formData.value_brl) <= 0) {
      alert('Por favor, informe um valor válido')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/sponsorship-tiers/${tierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          value_brl: parseFloat(formData.value_brl),
          description: formData.description.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar cota')
      }

      router.push('/settings/sponsorship-tiers')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao atualizar cota. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/settings/sponsorship-tiers" 
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Voltar para Cotas de Patrocínio
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Editar Cota de Patrocínio
          </h1>
        </div>

        {/* Form */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Informações da Cota</CardTitle>
            <CardDescription>
              Atualize os dados da cota de patrocínio
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
                  placeholder="Ex: Title, Partner, Supplier"
                />
              </div>

              <div>
                <Label htmlFor="value_brl">Valor (R$) *</Label>
                <Input
                  id="value_brl"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value_brl}
                  onChange={(e) => setFormData({ ...formData, value_brl: e.target.value })}
                  required
                  placeholder="1500000"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional da cota"
                  rows={4}
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

        {/* Entregáveis (Template) */}
        <Card className="border-border mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Entregáveis (Template)</CardTitle>
                <CardDescription>
                  Gerencie os entregáveis padrão desta cota. Estes serão usados como base ao criar novos deals.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? 'Cancelar' : '+ Adicionar Entregável'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddForm && (
              <div className="mb-6 p-4 border border-border rounded-lg space-y-3 bg-muted/50">
                <div>
                  <Label htmlFor="new_name">Nome do Entregável *</Label>
                  <Input
                    id="new_name"
                    value={newCounterpart.name}
                    onChange={(e) => setNewCounterpart({ ...newCounterpart, name: e.target.value })}
                    placeholder="Ex: Gift Finisher"
                  />
                </div>
                <div>
                  <Label htmlFor="new_details">Descrição Base (opcional)</Label>
                  <Textarea
                    id="new_details"
                    value={newCounterpart.details}
                    onChange={(e) => setNewCounterpart({ ...newCounterpart, details: e.target.value })}
                    placeholder="Descrição geral do entregável (será compartilhada entre todas as cotas)"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="new_tier_details">Termos/Detalhes desta Cota (opcional)</Label>
                  <Input
                    id="new_tier_details"
                    value={newCounterpart.tier_details}
                    onChange={(e) => setNewCounterpart({ ...newCounterpart, tier_details: e.target.value })}
                    placeholder="Ex: 2 páginas, 40m², 10%"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="new_included"
                    checked={newCounterpart.included}
                    onChange={(e) => setNewCounterpart({ ...newCounterpart, included: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="new_included" className="cursor-pointer">
                    Incluído por padrão
                  </Label>
                </div>
                <Button type="button" onClick={handleAddCounterpart}>
                  Adicionar
                </Button>
              </div>
            )}

            {loadingCounterparts ? (
              <p className="text-muted-foreground">Carregando entregáveis...</p>
            ) : counterparts.length === 0 ? (
              <p className="text-muted-foreground">Nenhum entregável configurado ainda.</p>
            ) : (
              <div className="space-y-4">
                {counterparts.map((counterpart) => (
                  <div
                    key={counterpart.id}
                    className="p-4 border border-border rounded-lg space-y-3"
                  >
                    {editingId === counterpart.id ? (
                      <>
                        <div>
                          <Label>Nome (do entregável único)</Label>
                          <Input
                            value={counterpart.name}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            O nome não pode ser editado aqui. O entregável é compartilhado entre todas as cotas.
                          </p>
                        </div>
                        {counterpart.details && (
                          <div>
                            <Label>Descrição Base (read-only)</Label>
                            <Textarea
                              value={counterpart.details || ''}
                              disabled
                              rows={3}
                              className="bg-muted"
                            />
                          </div>
                        )}
                        <div>
                          <Label>Termos/Detalhes desta Cota</Label>
                          <Input
                            value={counterpart.tier_details || ''}
                            onChange={(e) => {
                              const updated = counterparts.map((c) =>
                                c.id === counterpart.id ? { ...c, tier_details: e.target.value } : c
                              )
                              setCounterparts(updated)
                            }}
                            placeholder="Ex: 2 páginas, 40m², 10%"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={counterpart.included}
                            onChange={(e) => {
                              const updated = counterparts.map((c) =>
                                c.id === counterpart.id ? { ...c, included: e.target.checked } : c
                              )
                              setCounterparts(updated)
                            }}
                            className="rounded"
                          />
                          <Label className="cursor-pointer">Incluído por padrão</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleSaveCounterpart(counterpart)}
                          >
                            Salvar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingId(null)
                              fetchCounterparts()
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-foreground">{counterpart.name}</h4>
                              {counterpart.included ? (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  Incluído
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  Não incluído
                                </span>
                              )}
                            </div>
                            {counterpart.tier_details && (
                              <p className="text-sm font-medium text-foreground mt-1">
                                {counterpart.tier_details}
                              </p>
                            )}
                            {counterpart.details && (
                              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                {counterpart.details}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingId(counterpart.id)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCounterpart(counterpart.id)}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



