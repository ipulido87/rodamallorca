export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID'

export interface SubscriptionDTO {
  id: string
  workshopId: string
  stripeCustomerId: string
  stripeSubscriptionId?: string | null
  stripePriceId: string
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd?: boolean
  canceledAt?: Date | null
  trialStart?: Date | null
  trialEnd?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateSubscriptionInput {
  workshopId: string
  stripeCustomerId: string
  stripePriceId: string
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialStart?: Date
  trialEnd?: Date
  stripeSubscriptionId?: string
}

export interface UpdateSubscriptionInput {
  stripeSubscriptionId?: string
  status?: SubscriptionStatus
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
  canceledAt?: Date | null
  trialStart?: Date | null
  trialEnd?: Date | null
}

export interface SubscriptionRepository {
  create(data: CreateSubscriptionInput): Promise<SubscriptionDTO>
  findByWorkshopId(workshopId: string): Promise<SubscriptionDTO | null>
  findByStripeCustomerId(customerId: string): Promise<SubscriptionDTO | null>
  findByStripeSubscriptionId(subscriptionId: string): Promise<SubscriptionDTO | null>
  update(workshopId: string, data: UpdateSubscriptionInput): Promise<SubscriptionDTO>
  delete(workshopId: string): Promise<void>
}
