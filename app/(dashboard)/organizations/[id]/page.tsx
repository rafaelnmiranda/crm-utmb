import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ContactCard from './components/ContactCard'
import type { Organization, Sector } from '@/types'

export default async function OrganizationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAuth()
  const supabase = createServerClient()
  
  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !organization) {
    notFound()
  }

  // Buscar contatos da empresa
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('organization_id', params.id)
    .order('created_at', { ascending: false })

  // Buscar setores da empresa
  let sectors: Sector[] = []
  if (organization.sector_ids && organization.sector_ids.length > 0) {
    const { data: sectorsData } = await supabase
      .from('sectors')
      .select('*')
      .in('id', organization.sector_ids)
      .order('name', { ascending: true })
    
    sectors = sectorsData || []
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/organizations">
          <Button variant="outline">← Voltar</Button>
        </Link>
      </div>

      <Card className="mb-6 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{organization.name}</CardTitle>
              <CardDescription>
                {organization.partner_subcategory && (
                  <span className="inline-block rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground mt-2">
                    {organization.partner_subcategory}
                  </span>
                )}
              </CardDescription>
            </div>
            <Link href={`/organizations/${params.id}/edit`}>
              <Button variant="outline">Editar</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {organization.website && (
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground">Website</p>
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {organization.website}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6 border-border">
        <CardHeader>
          <CardTitle>Setores</CardTitle>
          <CardDescription>
            Setores vinculados a esta empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sectors && sectors.length > 0 ? (
            <div className="space-y-2">
              {sectors.map((sector) => (
                <div
                  key={sector.id}
                  className="border border-border rounded p-3 bg-card"
                >
                  <p className="font-medium text-foreground">{sector.name}</p>
                  {sector.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {sector.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum setor cadastrado.</p>
          )}
          <div className="mt-4">
            <Link href={`/organizations/${params.id}/edit`}>
              <Button variant="outline">Editar Setores</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Contatos</CardTitle>
          <CardDescription>
            Pessoas vinculadas a esta empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts && contacts.length > 0 ? (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  organizationId={params.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nenhum contato cadastrado.</p>
          )}
          <div className="mt-4">
            <Link href={`/organizations/${params.id}/contacts/new`}>
              <Button variant="outline">Adicionar Contato</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


