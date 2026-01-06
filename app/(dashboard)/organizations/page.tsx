import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import OrganizationsView from './components/OrganizationsView'
import type { Organization, Sector } from '@/types'

export interface OrganizationWithCounts extends Organization {
  contacts_count: number
  deals_count: number
  sectors: Sector[]
}

export default async function OrganizationsPage() {
  await requireAuth()
  const supabase = createServerClient()
  
  // Buscar organizações
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching organizations:', error)
  }

  // Buscar todos os setores
  const { data: allSectors } = await supabase
    .from('sectors')
    .select('*')
    .order('name', { ascending: true })

  // Buscar contagens de contatos e deals para cada organização, e também os setores
  const organizationsWithCounts: OrganizationWithCounts[] = await Promise.all(
    (organizations || []).map(async (org) => {
      // Contar contatos
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)

      // Contar deals
      const { count: dealsCount } = await supabase
        .from('deals')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)

      // Buscar setores da organização
      let sectors: Sector[] = []
      if (org.sector_ids && org.sector_ids.length > 0) {
        const { data: sectorsData } = await supabase
          .from('sectors')
          .select('*')
          .in('id', org.sector_ids)
          .order('name', { ascending: true })
        
        sectors = sectorsData || []
      }

      return {
        ...org,
        contacts_count: contactsCount || 0,
        deals_count: dealsCount || 0,
        sectors,
      }
    })
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Empresas</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gerencie patrocinadores, parceiros e expositores
          </p>
        </div>
        <Link href="/organizations/new">
          <Button>+ Nova Empresa</Button>
        </Link>
      </div>

      <OrganizationsView 
        organizations={organizationsWithCounts} 
        sectors={allSectors || []}
      />
    </div>
  )
}


