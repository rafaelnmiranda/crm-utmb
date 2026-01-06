'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { PipelineStage } from '@/types'

export default function NewPipelineStagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [maxPosition, setMaxPosition] = useState(0)

  useEffect(() => {
    // Buscar a maior posição para definir a próxima
    const fetchMaxPosition = async () => {
      try {
        const response = await fetch('/api/pipeline-stages')
        if (response.ok) {
          const stages: PipelineStage[] = await response.json()
          const max = stages.length > 0 
            ? Math.max(...stages.map(s => s.position), 0)
            : 0
          setMaxPosition(max + 1)
        }
      } catch (error) {
        console.error('Error fetching stages:', error)
      }
    }

    fetchMaxPosition()
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    position: maxPosition,
    color: '#A0CED9',
    is_lost: false,
  })

  // Atualizar position quando maxPosition mudar
  useEffect(() => {
    setFormData(prev => ({ ...prev, position: maxPosition }))
  }, [maxPosition])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/pipeline-stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar estágio')
      }

      router.push('/settings/pipelines')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Erro ao criar estágio. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href="/settings/pipelines" 
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Voltar para Pipeline
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Novo Estágio
          </h1>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Informações do Estágio</CardTitle>
            <CardDescription>
              Adicione um novo estágio ao pipeline
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
                  placeholder="Nome do estágio"
                />
              </div>

              <div>
                <Label htmlFor="position">Posição *</Label>
                <Input
                  id="position"
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  required
                  min="0"
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  A posição determina a ordem do estágio no pipeline
                </p>
              </div>

              <div>
                <Label htmlFor="color">Cor *</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#A0CED9"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_lost"
                  type="checkbox"
                  checked={formData.is_lost}
                  onChange={(e) => setFormData({ ...formData, is_lost: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_lost" className="cursor-pointer">
                  Marcar como estágio de &quot;Perdido&quot;
                </Label>
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



