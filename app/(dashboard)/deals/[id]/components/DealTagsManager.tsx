'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { Tag, DealTag } from '@/types'

interface DealTagsManagerProps {
  dealId: string
  initialTags?: DealTag[]
}

export default function DealTagsManager({ dealId, initialTags = [] }: DealTagsManagerProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [dealTags, setDealTags] = useState<DealTag[]>(initialTags)
  const [selectedTagId, setSelectedTagId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Carregar todas as tags disponíveis
    fetch('/api/tags')
      .then((res) => res.json())
      .then((data) => setTags(data))
      .catch(console.error)
  }, [])

  const handleAddTag = async () => {
    if (!selectedTagId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_id: selectedTagId }),
      })

      if (response.ok) {
        const newDealTag = await response.json()
        setDealTags([...dealTags, newDealTag])
        setSelectedTagId('')
      }
    } catch (error) {
      console.error('Erro ao adicionar tag:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/tags?tag_id=${tagId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDealTags(dealTags.filter((dt) => dt.tag_id !== tagId))
      }
    } catch (error) {
      console.error('Erro ao remover tag:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentTagIds = dealTags.map((dt) => dt.tag_id)
  const availableTags = tags.filter((tag) => !currentTagIds.includes(tag.id))

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Tags</p>
      
      {/* Tags existentes */}
      {dealTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {dealTags.map((dealTag) => {
            const tag = (dealTag as any).tags || tags.find((t) => t.id === dealTag.tag_id)
            if (!tag) return null
            
            return (
              <div
                key={dealTag.id}
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: tag.color }}
              >
                <span>{tag.name}</span>
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  disabled={loading}
                  className="ml-1 hover:opacity-70 disabled:opacity-50"
                  type="button"
                >
                  ×
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Adicionar nova tag */}
      {availableTags.length > 0 && (
        <div className="flex gap-2">
          <select
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50"
          >
            <option value="">Selecione uma tag...</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <Button
            onClick={handleAddTag}
            disabled={!selectedTagId || loading}
            size="sm"
            type="button"
          >
            Adicionar
          </Button>
        </div>
      )}

      {dealTags.length === 0 && availableTags.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma tag disponível</p>
      )}
    </div>
  )
}



