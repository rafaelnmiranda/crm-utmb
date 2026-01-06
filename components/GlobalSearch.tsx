"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type SearchItem = {
  type: 'deal' | 'organization' | 'contact'
  id: string
  href: string
  title: string
  subtitle?: string
}

function typeLabel(t: SearchItem['type']) {
  if (t === 'deal') return 'Deal'
  if (t === 'organization') return 'Empresa'
  return 'Contato'
}

export default function GlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const shortcutHint = useMemo(() => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform)
    return isMac ? '⌘K' : 'Ctrl K'
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isK = e.key.toLowerCase() === 'k'
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => inputRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const query = q.trim()
    if (query.length < 2) {
      setItems([])
      setError(null)
      return
    }

    const handle = window.setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) throw new Error('Falha na busca')
        const data = await res.json()
        setItems((data.items || []) as SearchItem[])
      } catch (e: any) {
        setError(e.message || 'Erro na busca')
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => window.clearTimeout(handle)
  }, [q, open])

  const grouped = useMemo(() => {
    const by: Record<string, SearchItem[]> = { Deal: [], Empresa: [], Contato: [] }
    for (const it of items) {
      by[typeLabel(it.type)].push(it)
    }
    return by
  }, [items])

  function go(it: SearchItem) {
    setOpen(false)
    setQ('')
    setItems([])
    router.push(it.href)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="hidden md:flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <span className="text-muted-foreground">Buscar…</span>
        <span className="text-xs text-muted-foreground">{shortcutHint}</span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) {
            setQ('')
            setItems([])
            setError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Busca global</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Digite para buscar deals, empresas e contatos…"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {loading && <p className="text-sm text-muted-foreground">Buscando…</p>}

            {!loading && q.trim().length >= 2 && items.length === 0 && !error && (
              <p className="text-sm text-muted-foreground">Nenhum resultado.</p>
            )}

            <div className="space-y-4">
              {(['Deal', 'Empresa', 'Contato'] as const).map((g) => {
                const list = grouped[g] || []
                if (list.length === 0) return null
                return (
                  <div key={g} className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">{g}</p>
                    <div className="space-y-2">
                      {list.map((it) => (
                        <button
                          key={`${it.type}:${it.id}`}
                          type="button"
                          className="w-full text-left rounded-md border border-border p-3 hover:bg-muted/50 transition-colors"
                          onClick={() => go(it)}
                        >
                          <p className="text-sm font-medium text-foreground">{it.title}</p>
                          {it.subtitle && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{it.subtitle}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

