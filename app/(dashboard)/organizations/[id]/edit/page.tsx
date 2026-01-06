'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import type { Organization, Sector } from '@/types'
import DeleteOrganizationButton from '../components/DeleteOrganizationButton'

export default function EditOrganizationPage() {
  const router = useRouter()
  const params = useParams()
  const organizationId = params.id as string
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [sectors, setSectors] = useState<Sector[]>([])
  const [sectorSearch, setSectorSearch] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    sector_ids: [] as string[],
  })
  const [organizationName, setOrganizationName] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgResponse, sectorsResponse] = await Promise.all([
          fetch(`/api/organizations/${organizationId}`),
          fetch('/api/sectors'),
        ])

        if (!orgResponse.ok) {
          throw new Error('Erro ao carregar empresa')
        }

        const organization: Organization = await orgResponse.json()
        const sectorsData: Sector[] = sectorsResponse.ok ? await sectorsResponse.json() : []

        setSectors(sectorsData)
        setOrganizationName(organization.name || '')
        setFormData({
          name: organization.name || '',
          website: organization.website || '',
          sector_ids: organization.sector_ids || [],
        })
      } catch (error) {
        console.error('Error:', error)
        alert('Erro ao carregar empresa. Tente novamente.')
        router.push('/organizations')
      } finally {
        setLoadingData(false)
      }
    }

    if (organizationId) {
      fetchData()
    }
  }, [organizationId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          website: formData.website || null,
          sector_ids: formData.sector_ids || [],
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar empresa')
      }

      router.push(`/organizations/${organizationId}`)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao atualizar empresa. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="p-6 max-w-2xl">
        <Card className="border-border">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <Link href={`/organizations/${organizationId}`}>
          <Button variant="outline">← Voltar</Button>
        </Link>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Editar Empresa</CardTitle>
          <CardDescription>
            Atualize as informações da empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="sectors">Setores</Label>
              <Input
                id="sector_search"
                value={sectorSearch}
                onChange={(e) => setSectorSearch(e.target.value)}
                placeholder="Buscar setores..."
                className="mt-2"
              />
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {sectors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum setor cadastrado</p>
                ) : (
                  sectors
                    .filter((sector) =>
                      sector.name.toLowerCase().includes(sectorSearch.toLowerCase())
                    )
                    .map((sector) => (
                      <label
                        key={sector.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-accent p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={formData.sector_ids.includes(sector.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                sector_ids: [...formData.sector_ids, sector.id],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                sector_ids: formData.sector_ids.filter((id) => id !== sector.id),
                              })
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{sector.name}</span>
                      </label>
                    ))
                )}
              </div>
              {formData.sector_ids.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formData.sector_ids.length} setor(es) selecionado(s)
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-end">
              <DeleteOrganizationButton
                organizationId={organizationId}
                organizationName={organizationName}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

