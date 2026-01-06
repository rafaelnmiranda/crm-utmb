'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Tag } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function EditTagPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
  })

  useEffect(() => {
    // Buscar dados da tag
    const fetchTag = async () => {
      try {
        const response = await fetch(`/api/tags/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            alert('Tag não encontrada')
            router.push('/settings/tags')
            return
          }
          throw new Error('Erro ao buscar tag')
        }
        const tag: Tag = await response.json()
        
        setFormData({
          name: tag.name,
          color: tag.color,
        })
      } catch (error) {
        console.error('Error:', error)
        alert('Erro ao carregar tag')
        router.push('/settings/tags')
      } finally {
        setLoadingData(false)
      }
    }

    fetchTag()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar tag')
      }

      router.push('/settings/tags')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Erro ao atualizar tag. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao excluir tag')
      }

      router.push('/settings/tags')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      alert(error.message || 'Erro ao excluir tag. Tente novamente.')
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
            href="/settings/tags" 
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Voltar para Tags
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Editar Tag
          </h1>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Informações da Tag</CardTitle>
            <CardDescription>
              Edite as informações da tag
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
                  placeholder="Nome da tag"
                />
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
                    placeholder="#3B82F6"
                    className="flex-1"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Escolha uma cor para identificar visualmente esta tag
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
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Tag</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a tag &quot;{formData.name}&quot;? 
              Esta ação não pode ser desfeita e a tag será removida de todas as oportunidades associadas.
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


