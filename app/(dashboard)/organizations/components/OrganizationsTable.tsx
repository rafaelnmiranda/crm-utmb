'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { OrganizationWithCounts } from '../page'

type SortField = 'name' | 'created_at' | 'contacts_count' | 'deals_count'
type SortDirection = 'asc' | 'desc'

interface OrganizationsTableProps {
  organizations: OrganizationWithCounts[]
}

export default function OrganizationsTable({ organizations }: OrganizationsTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const sortedOrganizations = useMemo(() => {
    const sorted = [...organizations].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'contacts_count':
          aValue = a.contacts_count
          bValue = b.contacts_count
          break
        case 'deals_count':
          aValue = a.deals_count
          bValue = b.deals_count
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [organizations, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-muted-foreground ml-1">↕</span>
    }
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Nenhuma empresa cadastrada ainda.</p>
        <Link href="/organizations/new">
          <Button>Criar primeira empresa</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th
                className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Nome
                  <SortIcon field="name" />
                </div>
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Categoria
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Website
              </th>
              <th
                className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('contacts_count')}
              >
                <div className="flex items-center">
                  Contatos
                  <SortIcon field="contacts_count" />
                </div>
              </th>
              <th
                className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('deals_count')}
              >
                <div className="flex items-center">
                  Deals
                  <SortIcon field="deals_count" />
                </div>
              </th>
              <th
                className="px-4 md:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors hidden md:table-cell"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center">
                  Data de Criação
                  <SortIcon field="created_at" />
                </div>
              </th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {sortedOrganizations.map((org) => (
              <tr
                key={org.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 md:px-6 py-4">
                  <div className="text-sm font-medium text-foreground">
                    {org.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 md:hidden">
                    {org.sectors && org.sectors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {org.sectors.map((sector) => (
                          <span
                            key={sector.id}
                            className="inline-flex rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground"
                          >
                            {sector.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {org.website && (
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {org.website}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  {org.sectors && org.sectors.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {org.sectors.map((sector) => (
                        <span
                          key={sector.id}
                          className="inline-flex rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
                        >
                          {sector.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                  {org.website ? (
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate block max-w-xs"
                    >
                      {org.website}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground font-medium">
                    {org.contacts_count}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-foreground font-medium">
                    {org.deals_count}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <div className="text-sm text-muted-foreground">
                    {new Date(org.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/organizations/${org.id}`}>
                    <Button variant="outline" size="sm" className="w-full md:w-auto">
                      Ver Detalhes
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

