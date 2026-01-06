'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Contact } from '@/types'

export default function EditContactPage() {
  const router = useRouter()
  const params = useParams()
  const organizationId = params.id as string
  const contactId = params.contactId as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
  })

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const response = await fetch(`/api/contacts/${contactId}`)
        if (!response.ok) {
          throw new Error('Erro ao carregar contato')
        }
        const contact: Contact = await response.json()
        setFormData({
          name: contact.name || '',
          email: contact.email || '',
          phone: contact.phone || '',
          position: contact.position || '',
        })
      } catch (error) {
        console.error('Error:', error)
        alert('Erro ao carregar contato. Tente novamente.')
        router.back()
      } finally {
        setFetching(false)
      }
    }

    if (contactId) {
      fetchContact()
    }
  }, [contactId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          position: formData.position || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar contato')
      }

      router.push(`/organizations/${organizationId}`)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('Erro ao atualizar contato. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
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
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Editar Contato</CardTitle>
          <CardDescription>
            Edite as informações do contato
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
                placeholder="Nome completo"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Ex: Gerente de Marketing"
              />
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
        </CardContent>
      </Card>
    </div>
  )
}

