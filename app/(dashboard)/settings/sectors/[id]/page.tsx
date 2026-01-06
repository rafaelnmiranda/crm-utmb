'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Sector, SectorCategory } from '@/types'

const categoryLabels: Record<SectorCategory, string> = {
  event_requirement: 'Event Requirement',
  protected_transitional: 'Protected (Transitional)',
  restricted_1: 'Restricted 1',
  restricted_2: 'Restricted 2',
  prohibited: 'Prohibited',
  open: 'Open',
}

export default function EditSectorPage() {
  const router = useRouter()
  const params = useParams()
  const sectorId = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    category: '' as SectorCategory | '',
    description: '',
  })

  useEffect(() => {
    // Carregar dados do setor
    const fetchSector = async () => {
      try {
        const response = await fetch(`/api/sectors/${sectorId}`)
        if (!response.ok) {
          throw new Error('Erro ao carregar setor')
        }
        const sector: Sector = await response.json()
        setFormData({
          name: sector.name || '',
          category: sector.category || '',
          description: sector.description || '',
        })
      } catch (error) {
        console.error('Error:', error)
        alert('Erro ao carregar setor. Tente novamente.')
        router.push('/settings/sectors')
      } finally {
        setLoadingData(false)
      }
    }

    if (sectorId) {
      fetchSector()
    }
  }, [sectorId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Por favor, informe o nome do setor')
      return
    }

    if (!formData.category) {
      alert('Por favor, selecione uma categoria')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/sectors/${sectorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          category: formData.category,
          description: formData.description.trim() || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar setor')
      }

      router.push('/settings/sectors')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao atualizar setor. Tente novamente.')
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
            href="/settings/sectors" 
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Voltar para Setores
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Editar Setor
          </h1>
        </div>

        {/* Form */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Informações do Setor</CardTitle>
            <CardDescription>
              Atualize os dados do setor
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
                  placeholder="Ex: Technical Soles"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category || undefined}
                  onValueChange={(value) => setFormData({ ...formData, category: value as SectorCategory })}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event_requirement">{categoryLabels.event_requirement}</SelectItem>
                    <SelectItem value="protected_transitional">{categoryLabels.protected_transitional}</SelectItem>
                    <SelectItem value="restricted_1">{categoryLabels.restricted_1}</SelectItem>
                    <SelectItem value="restricted_2">{categoryLabels.restricted_2}</SelectItem>
                    <SelectItem value="prohibited">{categoryLabels.prohibited}</SelectItem>
                    <SelectItem value="open">{categoryLabels.open}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional do setor"
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
      </div>
    </div>
  )
}
