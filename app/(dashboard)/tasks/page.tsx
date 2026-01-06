import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TasksList from './components/TasksList'

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

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export default async function TasksPage() {
  await requireAuth()
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('activities')
    .select(`
      id,
      deal_id,
      title,
      description,
      activity_date,
      completed,
      type,
      deals (
        id,
        title,
        organizations ( id, name )
      )
    `)
    .eq('type', 'task')
    .eq('completed', false)
    .order('activity_date', { ascending: true })

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-600">Erro ao carregar tarefas: {error.message}</p>
      </div>
    )
  }

  const tasks = ((data || []) as any[]).map((t) => {
    // Normalizar deals (pode vir como array ou objeto)
    let deal = null
    if (t.deals) {
      if (Array.isArray(t.deals) && t.deals.length > 0) {
        deal = t.deals[0]
      } else if (!Array.isArray(t.deals)) {
        deal = t.deals
      }
    }

    // Normalizar organizations dentro do deal (pode vir como array ou objeto)
    if (deal && deal.organizations) {
      if (Array.isArray(deal.organizations) && deal.organizations.length > 0) {
        deal.organizations = deal.organizations[0]
      } else if (Array.isArray(deal.organizations) && deal.organizations.length === 0) {
        deal.organizations = null
      }
      // Se já é um objeto, mantém como está
    }

    const normalizedTask = {
      ...t,
      deals: deal,
    }

    // Debug: log para verificar estrutura dos dados
    if (process.env.NODE_ENV === 'development') {
      console.log('Task normalized:', {
        id: normalizedTask.id,
        title: normalizedTask.title,
        hasDeal: !!normalizedTask.deals,
        hasOrg: !!normalizedTask.deals?.organizations,
        orgName: normalizedTask.deals?.organizations?.name,
        rawDeals: t.deals,
      })
    }

    return normalizedTask
  }) as TaskRow[]

  const now = new Date()
  const todayStart = startOfDay(now)
  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(todayStart.getDate() + 1)
  const weekEnd = new Date(todayStart)
  weekEnd.setDate(todayStart.getDate() + 7)

  // Filtrar tarefas por data, tratando casos onde activity_date pode ser inválido
  const overdue = tasks.filter((t) => {
    if (!t.activity_date) return false
    const taskDate = new Date(t.activity_date)
    return !isNaN(taskDate.getTime()) && taskDate < todayStart
  })
  
  const today = tasks.filter((t) => {
    if (!t.activity_date) return false
    const taskDate = new Date(t.activity_date)
    return !isNaN(taskDate.getTime()) && taskDate >= todayStart && taskDate < tomorrowStart
  })
  
  const next7 = tasks.filter((t) => {
    if (!t.activity_date) return false
    const taskDate = new Date(t.activity_date)
    return !isNaN(taskDate.getTime()) && taskDate >= tomorrowStart && taskDate < weekEnd
  })
  
  const later = tasks.filter((t) => {
    if (!t.activity_date) return false
    const taskDate = new Date(t.activity_date)
    return !isNaN(taskDate.getTime()) && taskDate >= weekEnd
  })
  
  // Tarefas sem data válida vão para "Depois"
  const tasksWithoutDate = tasks.filter((t) => {
    if (!t.activity_date) return true
    const taskDate = new Date(t.activity_date)
    return isNaN(taskDate.getTime())
  })
  
  // Adicionar tarefas sem data à seção "Depois"
  later.push(...tasksWithoutDate)

  const sections: Array<{ title: string; items: TaskRow[] }> = [
    { title: 'Atrasadas', items: overdue },
    { title: 'Hoje', items: today },
    { title: 'Próximos 7 dias', items: next7 },
    { title: 'Depois', items: later },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tarefas</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground">
            O que você precisa fazer agora (por deal).
          </p>
        </div>
        <Link href="/kanban">
          <Button variant="outline">Ver Pipeline</Button>
        </Link>
      </div>

      <TasksList initialTasks={tasks} sections={sections} />
    </div>
  )
}




