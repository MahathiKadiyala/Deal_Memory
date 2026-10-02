export type DealStage = 'Discovery' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost'
export type DealHealth = 'Healthy' | 'At Risk' | 'Stalled'

export interface Deal {
  id: string
  name: string
  account: string
  value: number
  stage: DealStage
  health: DealHealth
  nextActivity: string
  nextActionDate: string
  lastInteraction: string
  mainObjection?: string
  memoryScore: number
  stakeholdersCount: number
  owner: string
  expectedClose: string
  probability: number
  currentObjection?: string
  competitor?: string
  buyingSignal?: string
  description?: string
}

export type StakeholderRelationship = 'Decision Maker' | 'Champion' | 'Influencer' | 'Blocker'

export interface Stakeholder {
  id: string
  dealId: string
  name: string
  role: string
  relationship: StakeholderRelationship
  avatar: string
  lastInteraction: string
  notes?: string
}

export type MemoryType = 'worked' | 'failed' | 'preference' | 'objection' | 'competitor'

export interface MemoryItem {
  id: string
  type: MemoryType
  title: string
  description: string
  dealId?: string
  dealName?: string
  accountName?: string
  outcome: string
  confidence: 'High' | 'Medium' | 'Low'
  date: string
  evidenceCount: number
  source: string
}

export type InteractionType = 'Call' | 'Email' | 'Meeting' | 'Demo' | 'Negotiation' | 'Note'
export type InteractionOutcome = 'Positive' | 'Neutral' | 'Negative' | 'Needs follow-up'

export interface Interaction {
  id: string
  dealId: string
  accountName: string
  dealName: string
  stakeholderName: string
  stakeholderRole?: string
  date: string
  time?: string
  type: InteractionType
  title: string
  description: string
  concern?: string
  approach?: string
  outcome: InteractionOutcome
  retainedInHindsight?: boolean
}

export interface Account {
  id: string
  name: string
  industry: string
  openDeals: number
  totalValue: number
  primaryContact: string
  lastActivity: string
  health: DealHealth
}

export interface FollowUp {
  id: string
  dealId: string
  accountName: string
  dealName: string
  contactName: string
  date: string
  time: string
  action: string
  category: 'Today' | 'Tomorrow' | 'Upcoming' | 'Overdue' | 'Completed'
  status: 'pending' | 'completed'
}

export interface DealBriefing {
  dealId: string
  accountName: string
  dealName: string
  rememberedInteractionsCount: number
  whatYouShouldKnow: string[]
  whatWorkedBefore: {
    title: string
    detail: string
    recommendation: string
  }
  whatDidntWork: {
    title: string
    detail: string
    avoid: string
  }
  stakeholderContext: {
    name: string
    role: string
    notes: string
  }[]
  pendingCommitments: string[]
  aiRecommendation: string
}

export interface RealDealBriefingContent {
  key_points: string[]
  what_worked: string[]
  what_failed: string[]
  stakeholders: string[]
  pending_commitments: string[]
  recommended_approach: string
  evidence: string[]
}

export interface RealDealBriefingResponse {
  deal_id: string
  deal_name: string
  account_name: string
  hindsight_status: 'recalled' | 'failed' | 'not_configured' | string
  recalled_memories_count: number
  model: string
  briefing: RealDealBriefingContent
  error?: string | null
}
