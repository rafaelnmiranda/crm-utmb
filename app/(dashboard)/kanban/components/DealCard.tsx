'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getTextColorForBackground } from '@/lib/utils'
import type { Deal } from '@/types'

interface DealCardProps {
  deal: Deal
  isDragging?: boolean
  onEdit?: (deal: Deal) => void
}

export default function DealCard({ deal, isDragging, onEdit }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: deal.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  const organization = (deal as any).organizations
  const event = (deal as any).events
  const dealTags = (deal as any).deal_tags || []
  const tags = dealTags.map((dt: any) => dt.tags).filter(Boolean)

  // Função para obter informações do tipo de deal
  const getTypeInfo = (type: string | null) => {
    switch (type) {
      case 'patrocinador':
        return { label: 'Patrocinador', color: '#3B82F6' } // Azul
      case 'parceiro':
        return { label: 'Parceiro', color: '#10B981' } // Verde
      case 'expositor':
        return { label: 'Expositor', color: '#F59E0B' } // Laranja
      default:
        return null
    }
  }

  const typeInfo = getTypeInfo(deal.type)

  const handleClick = (e: React.MouseEvent) => {
    // Não abrir modal se estiver arrastando
    if (isSortableDragging) {
      e.preventDefault()
      return
    }
    if (onEdit) {
      e.preventDefault()
      e.stopPropagation()
      onEdit(deal)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`relative rounded-lg bg-white border border-border p-3 md:p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex-shrink-0 ${
        isDragging || isSortableDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Tag do tipo no canto superior direito */}
      {typeInfo && (
        <span
          className={`absolute top-2 right-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
            getTextColorForBackground(typeInfo.color) === 'white' ? 'text-white' : 'text-gray-900'
          }`}
          style={{ backgroundColor: typeInfo.color }}
        >
          {typeInfo.label}
        </span>
      )}
      
      {/* Conteúdo do card com padding-right se houver tag */}
      <div className={typeInfo ? 'pr-16' : ''}>
        {organization ? (
          <h4 className="font-medium text-sm md:text-base text-foreground truncate">{organization.name}</h4>
        ) : (
          <h4 className="font-medium text-sm md:text-base text-muted-foreground truncate">Sem empresa</h4>
        )}
        {deal.title && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{deal.title}</p>
        )}
        {event && (
          <p className="mt-1 text-xs text-muted-foreground truncate">{event.name}</p>
        )}
        {/* Tags customizadas */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag: any) => {
              const textColor = getTextColorForBackground(tag.color)
              return (
                <span
                  key={tag.id}
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    textColor === 'white' ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              )
            })}
            {tags.length > 3 && (
              <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
        {deal.value_monetary && (
          <p className="mt-2 text-xs md:text-sm font-semibold text-foreground">
            R$ {deal.value_monetary.toLocaleString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  )
}


