"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase/client'

type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task'

type ActivityRow = {
  id: string
  deal_id: string
  type: ActivityType
  title: string | null
  description: string | null
  activity_date: string
  next_action: string | null
  next_action_date: string | null
  completed: boolean
  created_at: string
}

type AiMessageRow = {
  id: string
  deal_id: string | null
  template_type: string | null
  prompt: string
  generated_text: string
  edited_text: string | null
  sent: boolean
  created_at: string
}

type DealDocumentRow = {
  id: string
  deal_id: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

type TimelineItem =
  | { kind: 'activity'; at: string; row: ActivityRow }
  | { kind: 'ai_message'; at: string; row: AiMessageRow }
  | { kind: 'document'; at: string; row: DealDocumentRow }

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR')
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

function formatDateShort(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function nextWeekday(base: Date, weekday: number) {
  // weekday: 0 (Sun) .. 6 (Sat)
  const d = new Date(base)
  const baseW = d.getDay()
  let delta = (weekday - baseW + 7) % 7
  if (delta === 0) delta = 7
  d.setDate(d.getDate() + delta)
  return d
}

function parseTime(text: string) {
  // matches: 10h, 10:30, 10h30
  const m = text.match(/\b([01]?\d|2[0-3])(?:h|:)?([0-5]\d)?\b/i)
  if (!m) return null
  const hour = parseInt(m[1], 10)
  const minute = m[2] ? parseInt(m[2], 10) : 0
  return { hour, minute, match: m[0] }
}

function parseDatePt(text: string, now = new Date()) {
  const lower = text.toLowerCase()
  const today = startOfDay(now)

  // dd/mm or dd/mm/yyyy
  const dm = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/)
  if (dm) {
    const day = parseInt(dm[1], 10)
    const month = parseInt(dm[2], 10) - 1
    const yearRaw = dm[3]
    const year = yearRaw ? (yearRaw.length === 2 ? 2000 + parseInt(yearRaw, 10) : parseInt(yearRaw, 10)) : now.getFullYear()
    const d = new Date(year, month, day, 12, 0, 0, 0)
    return { date: d, match: dm[0] }
  }

  // hoje/amanhã/depois de amanhã
  if (/\bdepois de amanh[ãa]\b/.test(lower)) {
    const d = new Date(today)
    d.setDate(d.getDate() + 2)
    d.setHours(12, 0, 0, 0)
    return { date: d, match: 'depois de amanhã' }
  }
  if (/\bamanh[ãa]\b/.test(lower)) {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    d.setHours(12, 0, 0, 0)
    return { date: d, match: 'amanhã' }
  }
  if (/\bhoje\b/.test(lower)) {
    const d = new Date(today)
    d.setHours(12, 0, 0, 0)
    return { date: d, match: 'hoje' }
  }

  // em X dias
  const inDays = lower.match(/\bem\s+(\d{1,2})\s+dias?\b/)
  if (inDays) {
    const days = parseInt(inDays[1], 10)
    const d = new Date(today)
    d.setDate(d.getDate() + days)
    d.setHours(12, 0, 0, 0)
    return { date: d, match: inDays[0] }
  }

  // weekdays
  const weekdayMap: Record<string, number> = {
    domingo: 0,
    seg: 1, segunda: 1, 'segunda-feira': 1,
    ter: 2, terça: 2, 'terca': 2, 'terça-feira': 2, 'terca-feira': 2,
    qua: 3, quarta: 3, 'quarta-feira': 3,
    qui: 4, quinta: 4, 'quinta-feira': 4,
    sex: 5, sexta: 5, 'sexta-feira': 5,
    sab: 6, sábado: 6, 'sabado': 6, 'sábado-feira': 6,
  }
  const wk = Object.keys(weekdayMap).find((k) => new RegExp(`\\b${k}\\b`, 'i').test(lower))
  if (wk) {
    const d = nextWeekday(today, weekdayMap[wk])
    d.setHours(12, 0, 0, 0)
    return { date: d, match: wk }
  }

  return null
}

function parseSmartTask(input: string) {
  // supports: "Enviar proposta amanhã 10h - falar com João"
  const raw = input.trim()
  if (!raw) return null

  const now = new Date()
  const datePart = parseDatePt(raw, now)
  const timePart = parseTime(raw)

  let due = datePart?.date ? new Date(datePart.date) : new Date(now)
  if (datePart?.date) {
    // keep day at noon unless time overrides
    due = new Date(datePart.date)
  } else {
    // default: today 12:00 so it shows in lists predictably
    due = startOfDay(now)
    due.setHours(12, 0, 0, 0)
  }

  if (timePart) {
    due.setHours(timePart.hour, timePart.minute, 0, 0)
  }

  let cleaned = raw
  if (datePart?.match) cleaned = cleaned.replace(datePart.match, ' ')
  if (timePart?.match) cleaned = cleaned.replace(timePart.match, ' ')
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  // split details by " - " or newline
  const parts = cleaned.split(/\s+-\s+|\n+/)
  const title = (parts[0] || '').trim()
  const details = parts.slice(1).join('\n').trim()

  if (!title) return null
  return {
    title,
    details: details || null,
    dueIso: due.toISOString(),
    dueLabel: formatDateShort(due.toISOString()),
  }
}

async function fetchActivities(dealId: string) {
  const res = await fetch(`/api/activities?deal_id=${encodeURIComponent(dealId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    throw new Error('Falha ao carregar atividades')
  }
  return (await res.json()) as ActivityRow[]
}

export default function DealActivityCenter({
  dealId,
}: {
  dealId: string
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [aiMessages, setAiMessages] = useState<AiMessageRow[]>([])
  const [documents, setDocuments] = useState<DealDocumentRow[]>([])

  // Task form
  const [taskSmartText, setTaskSmartText] = useState('')
  const [taskAdvanced, setTaskAdvanced] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDetails, setTaskDetails] = useState('')
  const [taskDueDate, setTaskDueDate] = useState<string>('') // yyyy-mm-dd
  const [taskSaving, setTaskSaving] = useState(false)

  // Interaction form
  const [interactionType, setInteractionType] = useState<ActivityType>('note')
  const [interactionText, setInteractionText] = useState('')
  const [interactionSaving, setInteractionSaving] = useState(false)

  // Document upload
  const [uploading, setUploading] = useState(false)

  // Document delete confirmation
  const [deletingDocument, setDeletingDocument] = useState<DealDocumentRow | null>(null)
  const [deletingDocumentLoading, setDeletingDocumentLoading] = useState(false)

  // AI
  const [aiTemplate, setAiTemplate] = useState('email_followup')
  const [aiExtraPrompt, setAiExtraPrompt] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiSubject, setAiSubject] = useState<string>('')
  const [aiBody, setAiBody] = useState<string>('')
  const [aiCopied, setAiCopied] = useState<string | null>(null)
  const [aiMessageId, setAiMessageId] = useState<string | null>(null)

  // Task edit modal
  const [editingTask, setEditingTask] = useState<ActivityRow | null>(null)
  const [editTaskTitle, setEditTaskTitle] = useState('')
  const [editTaskDescription, setEditTaskDescription] = useState('')
  const [editTaskDueDate, setEditTaskDueDate] = useState('')
  const [editTaskCompleted, setEditTaskCompleted] = useState(false)
  const [editTaskSaving, setEditTaskSaving] = useState(false)

  async function refreshAll() {
    setError(null)
    setLoading(true)
    try {
      const [acts, ai, docs] = await Promise.all([
        fetchActivities(dealId),
        supabase.from('ai_messages').select('*').eq('deal_id', dealId).order('created_at', { ascending: false }),
        supabase.from('deal_documents').select('*').eq('deal_id', dealId).order('created_at', { ascending: false }),
      ])

      setActivities(acts || [])

      if (ai.error) throw ai.error
      setAiMessages((ai.data || []) as any)

      if (docs.error) throw docs.error
      setDocuments((docs.data || []) as any)
    } catch (e: any) {
      setError(e.message || 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId])

  const openTasks = useMemo(() => {
    return activities
      .filter((a) => a.type === 'task' && a.completed === false)
      .sort((a, b) => new Date(a.activity_date).getTime() - new Date(b.activity_date).getTime())
  }, [activities])

  const completedTasks = useMemo(() => {
    return activities
      .filter((a) => a.type === 'task' && a.completed === true)
      .sort((a, b) => new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime())
      .slice(0, 10) // Mostrar apenas as 10 mais recentes
  }, [activities])

  const timeline = useMemo(() => {
    const items: TimelineItem[] = []
    for (const a of activities) items.push({ kind: 'activity', at: a.activity_date, row: a })
    for (const m of aiMessages) items.push({ kind: 'ai_message', at: m.created_at, row: m })
    for (const d of documents) items.push({ kind: 'document', at: d.created_at, row: d })
    return items.sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime())
  }, [activities, aiMessages, documents])

  async function createTask() {
    const parsed = parseSmartTask(taskSmartText)
    const finalTitle = parsed?.title ?? taskTitle
    const finalDetails = parsed?.details ?? (taskDetails.trim() ? taskDetails.trim() : null)

    if (!finalTitle.trim()) return
    setTaskSaving(true)
    setError(null)
    try {
      const dueIso =
        parsed?.dueIso ??
        (taskDueDate ? new Date(`${taskDueDate}T12:00:00`).toISOString() : new Date().toISOString())
      
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: dealId,
          type: 'task',
          title: finalTitle.trim(),
          description: finalDetails,
          activity_date: dueIso,
          completed: false,
        }),
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Falha ao criar tarefa')
      }

      setTaskSmartText('')
      setTaskTitle('')
      setTaskDetails('')
      setTaskDueDate('')
      setTaskAdvanced(false)
      await refreshAll()
    } catch (e: any) {
      console.error('Erro ao criar tarefa:', e)
      setError(e.message || 'Erro ao criar tarefa')
    } finally {
      setTaskSaving(false)
    }
  }

  async function updateActivity(row: ActivityRow, patch: Partial<ActivityRow>) {
    const next: ActivityRow = { ...row, ...patch }
    const res = await fetch(`/api/activities/${encodeURIComponent(row.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: next.type,
        title: next.title,
        description: next.description,
        activity_date: next.activity_date,
        next_action: next.next_action,
        next_action_date: next.next_action_date,
        completed: next.completed,
      }),
    })
    if (!res.ok) throw new Error('Falha ao atualizar')
  }

  async function toggleTaskDone(task: ActivityRow) {
    setError(null)
    try {
      await updateActivity(task, { completed: !task.completed })
      await refreshAll()
    } catch (e: any) {
      setError(e.message || 'Erro ao atualizar tarefa')
    }
  }

  function openEditTaskModal(task: ActivityRow) {
    setEditingTask(task)
    setEditTaskTitle(task.title || '')
    setEditTaskDescription(task.description || '')
    // Converter activity_date para formato yyyy-mm-dd
    const date = new Date(task.activity_date)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    setEditTaskDueDate(`${year}-${month}-${day}`)
    setEditTaskCompleted(task.completed)
  }

  function closeEditTaskModal() {
    setEditingTask(null)
    setEditTaskTitle('')
    setEditTaskDescription('')
    setEditTaskDueDate('')
    setEditTaskCompleted(false)
  }

  async function saveTaskEdit() {
    if (!editingTask) return
    if (!editTaskTitle.trim()) {
      setError('O título da tarefa é obrigatório')
      return
    }

    setEditTaskSaving(true)
    setError(null)
    try {
      const dueIso = editTaskDueDate 
        ? new Date(`${editTaskDueDate}T12:00:00`).toISOString()
        : editingTask.activity_date

      await updateActivity(editingTask, {
        title: editTaskTitle.trim(),
        description: editTaskDescription.trim() || null,
        activity_date: dueIso,
        completed: editTaskCompleted,
      })
      
      await refreshAll()
      closeEditTaskModal()
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar alterações')
    } finally {
      setEditTaskSaving(false)
    }
  }

  async function deleteActivity(activityId: string) {
    setError(null)
    try {
      const res = await fetch(`/api/activities/${encodeURIComponent(activityId)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir')
      await refreshAll()
    } catch (e: any) {
      setError(e.message || 'Erro ao excluir')
    }
  }

  async function addInteraction() {
    if (!interactionText.trim()) return
    setInteractionSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: dealId,
          type: interactionType,
          description: interactionText.trim(),
          activity_date: new Date().toISOString(),
          completed: true,
        }),
      })
      if (!res.ok) throw new Error('Falha ao registrar atividade')
      setInteractionText('')
      await refreshAll()
    } catch (e: any) {
      setError(e.message || 'Erro ao registrar')
    } finally {
      setInteractionSaving(false)
    }
  }

  async function uploadDocument(file: File) {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('deal_id', dealId)
      const res = await fetch('/api/documents/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Falha ao enviar documento')
      }
      await refreshAll()
    } catch (e: any) {
      setError(e.message || 'Erro no upload')
    } finally {
      setUploading(false)
    }
  }

  function openDeleteDocumentDialog(document: DealDocumentRow) {
    setDeletingDocument(document)
  }

  function closeDeleteDocumentDialog() {
    setDeletingDocument(null)
  }

  async function confirmDeleteDocument() {
    if (!deletingDocument) return

    setDeletingDocumentLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(deletingDocument.id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || 'Falha ao excluir documento')
      }
      closeDeleteDocumentDialog()
      await refreshAll()
    } catch (e: any) {
      setError(e.message || 'Erro ao excluir')
    } finally {
      setDeletingDocumentLoading(false)
    }
  }

  async function generateAi() {
    setAiGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId,
          template: aiTemplate,
          customPrompt: aiExtraPrompt?.trim() || null,
        }),
      })
      if (!res.ok) throw new Error('Falha ao gerar com IA')
      const data = await res.json()
      const raw = (data.message || '') as string
      const parsed = parseAiEmail(raw)
      setAiSubject(data.subject || parsed.subject)
      setAiBody(data.body || parsed.body)
      setAiMessageId(data.id || null)
      await refreshAll()
    } catch (e: any) {
      setError(e.message || 'Erro ao gerar IA')
    } finally {
      setAiGenerating(false)
    }
  }

  function parseAiEmail(text: string): { subject: string; body: string } {
    const t = (text || '').trim()
    if (!t) return { subject: '', body: '' }

    const lines = t.split(/\r?\n/)
    let subject = ''
    let body = t

    // Prefer format:
    // ASSUNTO: ...
    // (blank)
    // CORPO:
    // ...
    const subjectLine = lines.find((l) => /^\s*assunto\s*:/i.test(l))
    if (subjectLine) {
      subject = subjectLine.replace(/^\s*assunto\s*:\s*/i, '').trim()
    }

    const corpoIdx = lines.findIndex((l) => /^\s*corpo\s*:\s*$/i.test(l) || /^\s*corpo\s*:/i.test(l))
    if (corpoIdx >= 0) {
      const after = lines
        .slice(corpoIdx)
        .join('\n')
        .replace(/^\s*corpo\s*:\s*/i, '')
        .trim()
      body = after
    } else if (subjectLine) {
      // If we found subject but not CORPO:, take everything after the subject line
      const idx = lines.findIndex((l) => l === subjectLine)
      const after = lines.slice(idx + 1).join('\n').trim()
      body = after || t
    }

    // Fallback subject if still empty: first non-empty line (shortened)
    if (!subject) {
      const first = lines.find((l) => l.trim())?.trim() || ''
      subject = first.length > 80 ? `${first.slice(0, 77)}…` : first
    }

    return { subject, body }
  }

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      setAiCopied(label)
      window.setTimeout(() => setAiCopied(null), 1500)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setAiCopied(label)
      window.setTimeout(() => setAiCopied(null), 1500)
    }
  }

  function combinedAiText() {
    const subject = (aiSubject || '').trim()
    const body = (aiBody || '').trim()
    if (!subject && !body) return ''
    if (!body) return `ASSUNTO: ${subject}`
    if (!subject) return body
    return `ASSUNTO: ${subject}\n\n${body}`
  }

  async function saveAiEditsAndMarkSent() {
    if (!aiMessageId) return
    setError(null)
    try {
      const edited = combinedAiText()
      const { error: upErr } = await supabase
        .from('ai_messages')
        .update({
          edited_text: edited,
          sent: true,
        })
        .eq('id', aiMessageId)
      if (upErr) throw upErr
      await refreshAll()
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar')
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Próximas tarefas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskSmart">Adicionar tarefa (inteligente)</Label>
            <Input
              id="taskSmart"
              value={taskSmartText}
              onChange={(e) => {
                setTaskSmartText(e.target.value)
                // keep manual fields as fallback if user prefers advanced
                const parsed = parseSmartTask(e.target.value)
                if (parsed && !taskAdvanced) {
                  setTaskTitle(parsed.title)
                  setTaskDetails(parsed.details ?? '')
                  // only set date if it looks like yyyy-mm-dd can be derived
                  const d = new Date(parsed.dueIso)
                  const yyyy = d.getFullYear()
                  const mm = String(d.getMonth() + 1).padStart(2, '0')
                  const dd = String(d.getDate()).padStart(2, '0')
                  setTaskDueDate(`${yyyy}-${mm}-${dd}`)
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  createTask()
                }
              }}
              placeholder="Ex: Enviar proposta amanhã 10h - pedir CNPJ"
            />
            <p className="text-xs text-muted-foreground">
              Dica: use “hoje/amanhã/terça”, “dd/mm”, “em 2 dias”, e opcionalmente “- detalhes”.
            </p>
            {parseSmartTask(taskSmartText)?.dueLabel && (
              <p className="text-xs text-muted-foreground">
                Vencimento entendido: <span className="font-medium text-foreground">{parseSmartTask(taskSmartText)!.dueLabel}</span>
              </p>
            )}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setTaskAdvanced((v) => !v)}
              >
                {taskAdvanced ? 'Ocultar detalhes' : 'Editar detalhes'}
              </Button>
            </div>
          </div>

          {taskAdvanced && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="taskTitle">Título</Label>
                  <Input
                    id="taskTitle"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Ex: Enviar proposta"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taskDue">Data (override)</Label>
                  <Input
                    id="taskDue"
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDetails">Detalhes</Label>
                <Textarea
                  id="taskDetails"
                  value={taskDetails}
                  onChange={(e) => setTaskDetails(e.target.value)}
                  placeholder="Contexto/observações…"
                />
              </div>
            </>
          )}
          <div className="flex justify-end">
            <Button
              onClick={createTask}
              disabled={taskSaving || (!taskSmartText.trim() && !taskTitle.trim())}
            >
              {taskSaving ? 'Salvando…' : 'Adicionar tarefa'}
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : openTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa aberta.</p>
          ) : (
            <div className="space-y-2">
              {openTasks.map((t) => (
                <div 
                  key={t.id} 
                  className="flex items-start justify-between gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => openEditTaskModal(t)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {t.title || 'Tarefa'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Vence em {formatDate(t.activity_date)}
                    </p>
                    {t.description && (
                      <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                        {t.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" onClick={() => toggleTaskDone(t)}>
                      Concluir
                    </Button>
                    <Button variant="outline" onClick={() => deleteActivity(t.id)}>
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {/* Tarefas concluídas */}
      {completedTasks.length > 0 && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Tarefas concluídas (recentes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedTasks.map((t) => (
              <div 
                key={t.id} 
                className="flex items-start justify-between gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => openEditTaskModal(t)}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate">
                    {t.title || 'Tarefa'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(t.activity_date)}
                  </p>
                  {t.description && (
                    <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                      {t.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" onClick={() => deleteActivity(t.id)}>
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Registrar interação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={interactionType} onValueChange={(v) => setInteractionType(v as ActivityType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Ligação</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="note">Nota</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={interactionText}
                onChange={(e) => setInteractionText(e.target.value)}
                placeholder="Ex: Liguei, alinhamos próximos passos…"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={addInteraction} disabled={interactionSaving || !interactionText.trim()}>
              {interactionSaving ? 'Salvando…' : 'Salvar no histórico'}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>IA (mensagens, e-mails e proposta)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiMessages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Últimas mensagens</Label>
                <Button variant="outline" onClick={refreshAll}>
                  Atualizar
                </Button>
              </div>
              <div className="space-y-2">
                {aiMessages.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="w-full text-left rounded-md border border-border p-3 hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      const text = m.edited_text || m.generated_text
                      const parsed = parseAiEmail(text)
                      setAiSubject(parsed.subject)
                      setAiBody(parsed.body)
                      setAiTemplate(m.template_type || aiTemplate)
                      setAiMessageId(m.id)
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground truncate">
                        {m.template_type || 'mensagem'}
                        {m.sent ? ' (enviada)' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {(m.edited_text || m.generated_text || '').replace(/\s+/g, ' ').trim()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={aiTemplate} onValueChange={setAiTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email_proposta_inicial">E-mail: proposta inicial</SelectItem>
                  <SelectItem value="email_followup">E-mail: follow-up</SelectItem>
                  <SelectItem value="email_negociacao">E-mail: negociação</SelectItem>
                  <SelectItem value="proposal_outline">Proposta (estrutura)</SelectItem>
                  <SelectItem value="whatsapp_followup">WhatsApp follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Instrução extra (opcional)</Label>
              <Textarea
                value={aiExtraPrompt}
                onChange={(e) => setAiExtraPrompt(e.target.value)}
                placeholder="Ex: tom mais direto, mencionar benefícios X e Y, incluir CTA para reunião…"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={generateAi} disabled={aiGenerating}>
              {aiGenerating ? 'Gerando…' : 'Gerar com IA'}
            </Button>
          </div>

          {(aiSubject || aiBody) && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-3 space-y-2">
                  <Label>Assunto (editável)</Label>
                  <Input value={aiSubject} onChange={(e) => setAiSubject(e.target.value)} placeholder="Assunto do email" />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label>Corpo (editável)</Label>
                  <Textarea value={aiBody} onChange={(e) => setAiBody(e.target.value)} rows={10} />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  {aiCopied ? `Copiado: ${aiCopied}` : 'Dica: copie e cole no Outlook.'}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(aiSubject || '', 'Assunto')}
                    disabled={!aiSubject.trim()}
                  >
                    Copiar assunto
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(aiBody || '', 'Corpo')}
                    disabled={!aiBody.trim()}
                  >
                    Copiar corpo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(combinedAiText(), 'Tudo')}
                    disabled={!combinedAiText()}
                  >
                    Copiar tudo
                  </Button>
                  <Button onClick={saveAiEditsAndMarkSent} disabled={!aiMessageId}>
                    Marcar como enviada
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Enviar documento</Label>
            <Input
              type="file"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) uploadDocument(f)
              }}
            />
            {uploading && <p className="text-sm text-muted-foreground">Enviando…</p>}
          </div>

          {documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum documento enviado.</p>
          ) : (
            <div className="space-y-2">
              {documents.map((d) => {
                const { data: urlData } = supabase.storage
                  .from('deal-documents')
                  .getPublicUrl(d.file_path)
                const publicUrl = urlData.publicUrl
                
                return (
                  <div key={d.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{d.file_name}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(d.created_at)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(publicUrl, '_blank')}
                      >
                        Abrir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDocumentDialog(d)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Timeline do Deal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem histórico ainda.</p>
          ) : (
            <div className="space-y-2">
              {timeline.map((item) => {
                if (item.kind === 'activity') {
                  const a = item.row
                  const isTask = a.type === 'task'
                  return (
                    <div 
                      key={`a:${a.id}`} 
                      className={`rounded-md border border-border p-3 ${isTask ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
                      onClick={isTask ? () => openEditTaskModal(a) : undefined}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">
                          {isTask ? `Tarefa: ${a.title || '—'}` : `Atividade: ${a.type}`}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(a.activity_date)}</p>
                      </div>
                      {a.description && (
                        <p className="mt-2 text-sm whitespace-pre-wrap">{a.description}</p>
                      )}
                      {isTask && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Status: {a.completed ? 'Concluída' : 'Aberta'}
                        </p>
                      )}
                      <div className="mt-2 flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" onClick={() => deleteActivity(a.id)}>
                          Excluir
                        </Button>
                      </div>
                    </div>
                  )
                }

                if (item.kind === 'ai_message') {
                  const m = item.row
                  return (
                    <div key={`m:${m.id}`} className="rounded-md border border-border p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">IA: {m.template_type || 'mensagem'}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(m.created_at)}</p>
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap">
                        {m.edited_text || m.generated_text}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Status: {m.sent ? 'enviada' : 'não enviada'}
                      </p>
                    </div>
                  )
                }

                const d = item.row
                const { data: urlData } = supabase.storage
                  .from('deal-documents')
                  .getPublicUrl(d.file_path)
                const publicUrl = urlData.publicUrl
                
                return (
                  <div key={`d:${d.id}`} className="rounded-md border border-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">Documento: {d.file_name}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(d.created_at)}</p>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(publicUrl, '_blank')}
                      >
                        Abrir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDocumentDialog(d)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      {/* Modal de confirmação de exclusão de documento */}
      <Dialog open={deletingDocument !== null} onOpenChange={(open) => !open && closeDeleteDocumentDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Documento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o documento &quot;{deletingDocument?.file_name}&quot;? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeDeleteDocumentDialog}
              disabled={deletingDocumentLoading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteDocument}
              disabled={deletingDocumentLoading}
            >
              {deletingDocumentLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edição de tarefa */}
      <Dialog open={editingTask !== null} onOpenChange={(open) => !open && closeEditTaskModal()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
            <DialogDescription>
              Edite os detalhes da tarefa abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-title">Título *</Label>
              <Input
                id="edit-task-title"
                value={editTaskTitle}
                onChange={(e) => setEditTaskTitle(e.target.value)}
                placeholder="Ex: Enviar proposta"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-description">Descrição</Label>
              <Textarea
                id="edit-task-description"
                value={editTaskDescription}
                onChange={(e) => setEditTaskDescription(e.target.value)}
                placeholder="Detalhes da tarefa..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-due-date">Data de vencimento</Label>
              <Input
                id="edit-task-due-date"
                type="date"
                value={editTaskDueDate}
                onChange={(e) => setEditTaskDueDate(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-task-completed"
                checked={editTaskCompleted}
                onChange={(e) => setEditTaskCompleted(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-task-completed" className="cursor-pointer">
                Tarefa concluída
              </Label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditTaskModal} disabled={editTaskSaving}>
              Cancelar
            </Button>
            <Button onClick={saveTaskEdit} disabled={editTaskSaving || !editTaskTitle.trim()}>
              {editTaskSaving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


