export type DealType = 'patrocinador' | 'parceiro' | 'expositor'
// Mantido para compatibilidade com código existente que ainda usa OrganizationType
export type OrganizationType = DealType
export type PartnerSubcategory = 'pousada' | 'restaurante' | 'outro'
export type SectorCategory = 
  | 'event_requirement'
  | 'protected_transitional'
  | 'restricted_1'
  | 'restricted_2'
  | 'prohibited'
  | 'open'

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task'

export interface Organization {
  id: string
  name: string
  partner_subcategory: PartnerSubcategory | null
  website: string | null
  sector_ids: string[]
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  organization_id: string
  name: string
  email: string | null
  phone: string | null
  position: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  name: string
  year: number
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface PipelineStage {
  id: string
  name: string
  position: number
  color: string
  is_lost: boolean
  created_at: string
}

export interface SponsorshipTier {
  id: string
  name: string
  value_brl: number
  description: string | null
  created_at: string
}

export interface SponsorshipCounterpart {
  id: string
  name: string
  details: string | null
  created_at: string
}

export interface SponsorshipTierCounterpart {
  id: string
  tier_id: string
  counterpart_id: string
  included: boolean
  tier_details: string | null
  sort_order: number
  created_at: string
  sponsorship_counterparts?: SponsorshipCounterpart
}

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface DealTag {
  id: string
  deal_id: string
  tag_id: string
  created_at: string
  tags?: Tag
}

export interface Deal {
  id: string
  title: string
  organization_id: string | null
  event_id: string
  stage_id: string | null
  sponsorship_tier_id: string | null
  type: DealType | null
  value_monetary: number | null
  value_barter: number | null
  currency: string
  barter_description: string | null
  stand_location: string | null
  expected_close_date: string | null
  created_at: string
  updated_at: string
  deal_tags?: DealTag[]
  tags?: Tag[]
}

export interface DealCounterpart {
  id: string
  deal_id: string
  counterpart_id: string | null
  name: string
  included: boolean
  details: string | null
  custom: boolean
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  deal_id: string
  type: ActivityType
  title?: string | null
  description: string | null
  activity_date: string
  next_action: string | null
  next_action_date: string | null
  completed: boolean
  created_at: string
}

export interface DealDocument {
  id: string
  deal_id: string
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  uploaded_by: string | null
  created_at: string
}

export interface Sector {
  id: string
  name: string
  category: SectorCategory
  description: string | null
  created_at: string
}


