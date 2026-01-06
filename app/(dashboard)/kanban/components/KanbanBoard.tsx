'use client'

import { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ChevronDown, Check } from 'lucide-react'
import KanbanColumn from './KanbanColumn'
import DealCard from './DealCard'
import DealEditModal from './DealEditModal'
import type { Deal, PipelineStage, Event, Organization, SponsorshipTier } from '@/types'
import { cn } from '@/lib/utils'

interface KanbanBoardProps {
  initialDeals: Deal[]
  stages: PipelineStage[]
  events: Event[]
}

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
  className?: string
}

function MultiSelect({ options, selected, onChange, placeholder, className }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const toggleOption = (value: string) => {
    if (value === 'all') {
      onChange([])
    } else {
      const newSelected = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
      onChange(newSelected)
    }
  }

  const allSelected = selected.length === 0
  const displayText = allSelected
    ? placeholder
    : selected.length === 1
    ? options.find((opt) => opt.value === selected[0])?.label || placeholder
    : `${selected.length} selecionados`

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between rounded-md border border-input bg-white px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 min-w-[140px] w-full"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md">
          <div className="p-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggleOption('all')
                setIsOpen(false)
              }}
              className={cn(
                'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                allSelected && 'bg-accent text-accent-foreground'
              )}
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {allSelected && <Check className="h-4 w-4" />}
              </span>
              {placeholder}
            </button>
            {options.map((option) => {
              const isSelected = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleOption(option.value)
                  }}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground',
                    isSelected && 'bg-accent text-accent-foreground'
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <Check className="h-4 w-4" />}
                  </span>
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function KanbanBoard({ initialDeals, stages, events }: KanbanBoardProps) {
  const [deals, setDeals] = useState(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [tiers, setTiers] = useState<SponsorshipTier[]>([])

  // Carregar organizações e tiers
  useEffect(() => {
    Promise.all([
      fetch('/api/organizations').then((r) => r.json()),
      fetch('/api/sponsorship-tiers').then((r) => r.json()),
    ]).then(([orgs, trs]) => {
      setOrganizations(orgs)
      setTiers(trs)
    })
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const dealId = active.id as string
    const overId = over.id as string

    // Verificar se está sendo solto sobre uma coluna (stage)
    let newStageId: string | null = null
    const targetStage = stages.find((stage) => stage.id === overId)
    
    if (targetStage) {
      // Foi solto diretamente na coluna
      newStageId = overId
    } else {
      // Foi solto sobre outro deal - encontrar a coluna desse deal
      const targetDeal = deals.find((deal) => deal.id === overId)
      if (targetDeal?.stage_id) {
        newStageId = targetDeal.stage_id
      } else {
        // Não encontrou nem coluna nem deal válido
        return
      }
    }

    if (!newStageId) return

    // Verificar se o deal já está nesta coluna
    const currentDeal = deals.find((deal) => deal.id === dealId)
    if (currentDeal?.stage_id === newStageId) {
      return
    }

    // Atualizar deal no banco
    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage_id: newStageId,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar deal')
      }

      // Atualizar estado local
      setDeals((prevDeals) =>
        prevDeals.map((deal) =>
          deal.id === dealId ? { ...deal, stage_id: newStageId } : deal
        )
      )
    } catch (error) {
      console.error('Error updating deal:', error)
      // Reverter mudança em caso de erro
      alert('Erro ao mover deal. Tente novamente.')
    }
  }

  // Filtrar deals
  const filteredDeals = deals.filter((deal) => {
    // Filtro por eventos
    if (selectedEvents.length > 0 && !selectedEvents.includes(deal.event_id || '')) {
      return false
    }
    // Filtro por tipos
    if (selectedTypes.length > 0) {
      if (!deal.type || !selectedTypes.includes(deal.type)) {
        return false
      }
    }
    return true
  })

  // Agrupar deals por estágio
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = filteredDeals.filter((deal) => deal.stage_id === stage.id)
    return acc
  }, {} as Record<string, Deal[]>)

  const activeDeal = deals.find((deal) => deal.id === activeId)

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    // Recarregar deals após atualização
    fetch('/api/deals')
      .then((r) => r.json())
      .then((updatedDeals) => {
        setDeals(updatedDeals)
      })
      .catch((error) => {
        console.error('Error reloading deals:', error)
      })
  }

  return (
    <>
      <div className="h-full flex flex-col space-y-4 min-h-0">
        {/* Filtros */}
        <div className="flex gap-2 md:gap-4 flex-shrink-0">
          <MultiSelect
            options={events.map((event) => ({ value: event.id, label: event.name }))}
            selected={selectedEvents}
            onChange={setSelectedEvents}
            placeholder="Todos os eventos"
            className="min-w-[160px]"
          />

          <MultiSelect
            options={[
              { value: 'patrocinador', label: 'Patrocinador' },
              { value: 'parceiro', label: 'Parceiro' },
              { value: 'expositor', label: 'Expositor' },
            ]}
            selected={selectedTypes}
            onChange={setSelectedTypes}
            placeholder="Todos os tipos"
            className="min-w-[140px]"
          />
        </div>

        {/* Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-3 md:gap-4 h-full pb-4">
              {stages.map((stage) => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  deals={dealsByStage[stage.id] || []}
                  onDealClick={handleEditDeal}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeDeal ? (
              <DealCard deal={activeDeal} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <DealEditModal
        deal={selectedDeal}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        organizations={organizations}
        events={events}
        stages={stages}
        tiers={tiers}
        onSuccess={handleModalSuccess}
      />
    </>
  )
}


