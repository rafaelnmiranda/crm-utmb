"use client"

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TaskCard from './TaskCard'
import TaskEditModal from './TaskEditModal'

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
    organizations?: { id: string; name: string } | { id: string; name: string }[] | null
  } | null
}

export default function TasksList({ 
  initialTasks, 
  sections 
}: { 
  initialTasks: TaskRow[]
  sections: Array<{ title: string; items: TaskRow[] }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null)

  async function handleCompleteTask(taskId: string) {
    try {
      const res = await fetch(`/api/activities/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })

      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.error || 'Erro ao concluir tarefa')
      }

      // Recarregar a página para atualizar a lista
      startTransition(() => {
        router.refresh()
      })
    } catch (error: any) {
      console.error('Erro ao concluir tarefa:', error)
      alert(error.message || 'Erro ao concluir tarefa')
    }
  }

  function handleEditTask(task: TaskRow) {
    setEditingTask(task)
  }

  function handleModalSuccess() {
    // Recarregar a página para atualizar a lista
    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <>
      {sections.map((s) => (
        <Card key={s.title} className="border-border">
          <CardHeader>
            <CardTitle>{s.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {s.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada aqui.</p>
            ) : (
              s.items.map((t) => (
                <TaskCard 
                  key={t.id} 
                  task={t} 
                  onComplete={handleCompleteTask}
                  onEdit={handleEditTask}
                />
              ))
            )}
          </CardContent>
        </Card>
      ))}
      <TaskEditModal
        task={editingTask}
        open={editingTask !== null}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSuccess={handleModalSuccess}
      />
    </>
  )
}
