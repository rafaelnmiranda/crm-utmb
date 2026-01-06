'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DeleteContactButton from './DeleteContactButton'
import type { Contact } from '@/types'

interface ContactCardProps {
  contact: Contact
  organizationId: string
}

function normalizePhoneForWhatsApp(phone: string): string {
  // Remove todos os caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '')
  
  // Se começar com +55, remove o +
  if (cleaned.startsWith('55')) {
    return cleaned
  }
  
  // Se começar com 0, remove o 0 e adiciona 55
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  
  // Se não começar com 55, adiciona
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned
  }
  
  return cleaned
}

export default function ContactCard({ contact, organizationId }: ContactCardProps) {
  const whatsappUrl = contact.phone 
    ? `https://wa.me/${normalizePhoneForWhatsApp(contact.phone)}`
    : null

  return (
    <div className="border border-border rounded p-3 bg-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-foreground">{contact.name}</p>
          {contact.position && (
            <p className="text-sm text-muted-foreground">{contact.position}</p>
          )}
          {contact.email && (
            <p className="text-sm text-muted-foreground">{contact.email}</p>
          )}
          {contact.phone && (
            <p className="text-sm text-muted-foreground">{contact.phone}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          {whatsappUrl && (
            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                WhatsApp
              </Button>
            </Link>
          )}
          <Link href={`/organizations/${organizationId}/contacts/${contact.id}/edit`}>
            <Button variant="outline" size="sm">
              Editar
            </Button>
          </Link>
          <DeleteContactButton
            contactId={contact.id}
            contactName={contact.name}
            organizationId={organizationId}
          />
        </div>
      </div>
    </div>
  )
}



