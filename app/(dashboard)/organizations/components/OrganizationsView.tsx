'use client'

import { useState } from 'react'
import OrganizationsTable from './OrganizationsTable'
import OrganizationsKanban from './OrganizationsKanban'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { OrganizationWithCounts } from '../page'
import type { Sector } from '@/types'

interface OrganizationsViewProps {
  organizations: OrganizationWithCounts[]
  sectors: Sector[]
}

type ViewMode = 'table' | 'kanban'

export default function OrganizationsView({ organizations, sectors }: OrganizationsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  return (
    <div className="flex flex-col">
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        <Button
          variant="ghost"
          onClick={() => setViewMode('table')}
          className={cn(
            'rounded-b-none border-b-2 border-transparent',
            viewMode === 'table' && 'border-primary bg-transparent hover:bg-transparent'
          )}
        >
          Tabela
        </Button>
        <Button
          variant="ghost"
          onClick={() => setViewMode('kanban')}
          className={cn(
            'rounded-b-none border-b-2 border-transparent',
            viewMode === 'kanban' && 'border-primary bg-transparent hover:bg-transparent'
          )}
        >
          Por Categorias
        </Button>
      </div>

      {/* Content */}
      <div>
        {viewMode === 'table' ? (
          <OrganizationsTable organizations={organizations} />
        ) : (
          <div className="h-[calc(100vh-320px)] min-h-[600px]">
            <OrganizationsKanban organizations={organizations} sectors={sectors} />
          </div>
        )}
      </div>
    </div>
  )
}
