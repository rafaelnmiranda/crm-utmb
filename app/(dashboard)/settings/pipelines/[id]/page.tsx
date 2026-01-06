'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { PipelineStage } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function EditPipelineStagePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    position: 0,
    color: '#A0CED9',
    is_lost: false,
  })

  useEffect(() => {
    // Buscar dados do estágio
    const fetchStage = async () => {
      try {
        const response = await fetch(`/api/pipeline-stages/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            alert('Estágio não encontrado')
            router.push('/settings/pipelines')
            return
          }
          throw new Error('Erro ao buscar estágio')
        }
        const stage: PipelineStage = await response.json()
        
        setFormData({
          name: stage.name,
          position: stage.position,
          color: stage.color,
          is_lost: stage.is_lost || false,
        })
      } catch (error) {
        console.error('Error:', error)
        alert('Erro ao carregar estágio')
        router.push('/settings/pipelines')
      } finally {
        setLoadingData(false)
      }
    }

    fetchStage()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/pipeline-stages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar estágio')
      }

      router.push('/settings/pipelines')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Erro ao atualizar estágio. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/pipeline-stages/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir estágio')
      }

      router.push('/settings/pipelines')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Erro ao excluir estágio. Tente novamente.')
      setDeleting(false)
      setShowDeleteDialog(false)
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
            href="/settings/pipelines" 
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Voltar para Pipeline
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Editar Estágio
          </h1>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Informações do Estágio</CardTitle>
            <CardDescription>
              Edite as informações do estágio do pipeline
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
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Estágio</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o estágio &quot;{formData.name}&quot;? 
              Esta ação não pode ser desfeita.
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
              disabled={deleting}
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

