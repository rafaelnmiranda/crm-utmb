'use client'

import Link from 'next/link'
import { User, Briefcase } from 'lucide-react'
import type { OrganizationWithCounts } from '../page'

interface OrganizationCardProps {
  organization: OrganizationWithCounts
}

export default function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <Link href={`/organizations/${organization.id}`}>
      <div className="rounded-lg bg-white border border-border p-3 md:p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm md:text-base text-foreground truncate">
              {organization.name}
            </h4>
            {organization.website && (
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {organization.website}
              </p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            {organization.contacts_count > 0 && (
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600"
                title={`${organization.contacts_count} contato${organization.contacts_count > 1 ? 's' : ''}`}
              >
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            {organization.deals_count > 0 && (
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600"
                title={`${organization.deals_count} deal${organization.deals_count > 1 ? 's' : ''}`}
              >
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
