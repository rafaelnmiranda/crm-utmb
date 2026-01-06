"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export default function TaskCard({ 
  task, 
  onComplete,
  onEdit 
}: { 
  task: TaskRow
  onComplete: (taskId: string) => Promise<void>
  onEdit: (task: TaskRow) => void
}) {
  const [completing, setCompleting] = useState(false)
  
  // Extrair nome da organização, tratando diferentes estruturas possíveis
  let orgName: string | undefined = undefined
  if (task.deals?.organizations) {
    if (Array.isArray(task.deals.organizations) && task.deals.organizations.length > 0) {
      orgName = task.deals.organizations[0]?.name
    } else if (typeof task.deals.organizations === 'object' && 'name' in task.deals.organizations) {
      orgName = task.deals.organizations.name
    }
  }

  async function handleComplete(e: React.MouseEvent) {
    e.stopPropagation()
    setCompleting(true)
    try {
      await onComplete(task.id)
    } finally {
      setCompleting(false)
    }
  }

  function handleCardClick() {
    onEdit(task)
  }

  return (
    <div 
      className="flex items-start justify-between gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-all active:scale-[0.99]"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="min-w-0 flex-1">
        {orgName && (
          <div className="mb-2.5">
            <span className="inline-block px-3 py-1.5 text-sm font-bold text-primary-foreground bg-primary rounded-md shadow-sm">
              {orgName}
            </span>
          </div>
        )}
        <p className="font-medium text-foreground truncate">{task.title || 'Tarefa'}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {task.activity_date ? `Vence em ${formatDate(task.activity_date)}` : 'Sem data'}
        </p>
        {task.description && (
          <p className="mt-2 text-sm text-foreground whitespace-pre-wrap line-clamp-2">{task.description}</p>
        )}
      </div>
      <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <Button 
          variant="outline" 
          onClick={handleComplete}
          disabled={completing}
          size="sm"
        >
          {completing ? 'Concluindo...' : 'Concluir'}
        </Button>
        {task.deal_id && (
          <Link href={`/deals/${task.deal_id}`}>
            <Button variant="outline" size="sm">
              Abrir Deal
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
