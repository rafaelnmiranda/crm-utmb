'use client'

import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import DealCard from './DealCard'
import type { Deal, PipelineStage } from '@/types'

interface KanbanColumnProps {
  stage: PipelineStage
  deals: Deal[]
  onDealClick?: (deal: Deal) => void
}

export default function KanbanColumn({ stage, deals, onDealClick }: KanbanColumnProps) {
  const dealIds = useMemo(() => deals.map((deal) => deal.id), [deals])

  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  })

  // Calculate total value for this stage
  const totalValue = deals.reduce((sum, deal) => sum + (deal.value_monetary || 0), 0)

  return (
    <div className="flex-shrink-0 w-72 md:w-80 h-full flex flex-col">
      <div
        ref={setNodeRef}
        className={`rounded-lg bg-white border border-border p-3 md:p-4 h-full flex flex-col transition-colors ${
          isOver ? 'border-primary bg-primary/5' : ''
        }`}
      >
        <div className="mb-3 md:mb-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h3 className="font-semibold text-sm md:text-base text-foreground truncate">{stage.name}</h3>
          </div>
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="text-muted-foreground truncate mr-2">
              {totalValue > 0 && `R$ ${totalValue.toLocaleString('pt-BR')}`}
            </span>
            <span className="text-muted-foreground whitespace-nowrap">
              {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} onEdit={onDealClick} />
              ))}
            </div>
          </SortableContext>

          {deals.length === 0 && (
            <div className="py-8 text-center text-xs md:text-sm text-muted-foreground">
              Nenhum deal neste estágio
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


