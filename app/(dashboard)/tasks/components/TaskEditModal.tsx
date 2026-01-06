"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

type TaskRow = {
  id: string
  deal_id: string
  title: string | null
  description: string | null
  activity_date: string
  completed: boolean
  deals?: {
    id: string
    title: string
    organizations?: { id: string; name: string } | null
  } | null
}

type TaskEditModalProps = {
  task: TaskRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function TaskEditModal({ task, open, onOpenChange, onSuccess }: TaskEditModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activityDate, setActivityDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Atualizar campos quando a tarefa mudar ou o modal abrir
  useEffect(() => {
    if (task && open) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      // Converter data ISO para formato YYYY-MM-DD para o input type="date"
      if (task.activity_date) {
        const date = new Date(task.activity_date)
        if (!isNaN(date.getTime())) {
          setActivityDate(date.toISOString().split('T')[0])
        } else {
          setActivityDate('')
        }
      } else {
        setActivityDate('')
      }
      setError(null)
    }
  }, [task, open])

  async function handleSave() {
    if (!task) return
    
    if (!title.trim()) {
      setError('O título é obrigatório')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Converter data para ISO string se fornecida
      const activityDateIso = activityDate 
        ? new Date(`${activityDate}T12:00:00`).toISOString()
        : task.activity_date

      const res = await fetch(`/api/activities/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          activity_date: activityDateIso,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao salvar tarefa')
      }

      onSuccess()
      onOpenChange(false)
    } catch (e: any) {
      console.error('Erro ao salvar tarefa:', e)
      setError(e.message || 'Erro ao salvar tarefa')
    } finally {
      setSaving(false)
    }
  }

  if (!task) return null

  const companyName = task.deals?.organizations?.name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          {companyName && (
            <div className="mt-2 mb-1">
              <span className="inline-block px-3 py-1.5 text-sm font-bold text-primary-foreground bg-primary rounded-md shadow-sm">
                {companyName}
              </span>
            </div>
          )}
          <DialogDescription>
            Edite os detalhes da tarefa abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-task-title">Título *</Label>
            <Input
              id="edit-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Enviar proposta"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-task-description">Descrição</Label>
            <Textarea
              id="edit-task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-task-due-date">Data de vencimento</Label>
            <Input
              id="edit-task-due-date"
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
