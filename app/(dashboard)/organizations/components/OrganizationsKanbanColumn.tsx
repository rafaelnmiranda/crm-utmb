'use client'

import { useMemo } from 'react'
import type { Sector } from '@/types'
import type { OrganizationWithCounts } from '../page'
import OrganizationCard from './OrganizationCard'

interface OrganizationsKanbanColumnProps {
  sector: Sector
  organizations: OrganizationWithCounts[]
}

export default function OrganizationsKanbanColumn({ 
  sector, 
  organizations 
}: OrganizationsKanbanColumnProps) {
  // Ordenar organizações alfabeticamente
  const sortedOrganizations = useMemo(() => {
    return [...organizations].sort((a, b) => {
      return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    })
  }, [organizations])

  return (
    <div className="flex-shrink-0 w-72 md:w-80 h-full flex flex-col">
      <div className="rounded-lg bg-white border border-border p-3 md:p-4 h-full flex flex-col">
        <div className="mb-3 md:mb-4 flex-shrink-0">
          <h3 className="font-semibold text-sm md:text-base text-foreground truncate mb-1 md:mb-2">
            {sector.name}
          </h3>
          <div className="text-xs md:text-sm text-muted-foreground">
            {sortedOrganizations.length} {sortedOrganizations.length === 1 ? 'empresa' : 'empresas'}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-2">
            {sortedOrganizations.map((org) => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>

          {sortedOrganizations.length === 0 && (
            <div className="py-8 text-center text-xs md:text-sm text-muted-foreground">
              Nenhuma empresa neste setor
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
