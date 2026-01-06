'use client'

import { useMemo } from 'react'
import type { Sector } from '@/types'
import type { OrganizationWithCounts } from '../page'
import OrganizationsKanbanColumn from './OrganizationsKanbanColumn'

interface OrganizationsKanbanProps {
  organizations: OrganizationWithCounts[]
  sectors: Sector[]
}

export default function OrganizationsKanban({ organizations, sectors }: OrganizationsKanbanProps) {
  // Agrupar organizações por setor
  // Uma organização pode aparecer em múltiplos setores
  const organizationsBySector = useMemo(() => {
    const grouped: Record<string, OrganizationWithCounts[]> = {}
    
    // Inicializar todas as colunas
    sectors.forEach((sector) => {
      grouped[sector.id] = []
    })

    // Adicionar organizações aos seus setores
    organizations.forEach((org) => {
      if (org.sectors && org.sectors.length > 0) {
        org.sectors.forEach((sector) => {
          if (!grouped[sector.id]) {
            grouped[sector.id] = []
          }
          grouped[sector.id].push(org)
        })
      }
    })

    return grouped
  }, [organizations, sectors])

  // Ordenar setores alfabeticamente
  const sortedSectors = useMemo(() => {
    return [...sectors].sort((a, b) => {
      return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    })
  }, [sectors])

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 md:gap-4 h-full pb-4">
          {sortedSectors.map((sector) => (
            <OrganizationsKanbanColumn
              key={sector.id}
              sector={sector}
              organizations={organizationsBySector[sector.id] || []}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
