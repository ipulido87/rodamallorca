import prisma from '../../../../../lib/prisma'
import type {
  SubscriptionRepository,
  SubscriptionDTO,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from '../../../domain/repositories/subscription-repository'

export class SubscriptionRepositoryPrisma implements SubscriptionRepository {
  async create(data: CreateSubscriptionInput): Promise<SubscriptionDTO> {
    const subscription = await prisma.subscription.create({
      data,
    })
    return subscription as SubscriptionDTO
  }

  async findByWorkshopId(workshopId: string): Promise<SubscriptionDTO | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { workshopId },
    })
    return subscription as SubscriptionDTO | null
  }

  async findByStripeCustomerId(customerId: string): Promise<SubscriptionDTO | null> {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    })
    return subscription as SubscriptionDTO | null
  }

  async findByStripeSubscriptionId(subscriptionId: string): Promise<SubscriptionDTO | null> {
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    })
    return subscription as SubscriptionDTO | null
  }

  async update(workshopId: string, data: UpdateSubscriptionInput): Promise<SubscriptionDTO> {
    const subscription = await prisma.subscription.update({
      where: { workshopId },
      data,
    })
    return subscription as SubscriptionDTO
  }

  async delete(workshopId: string): Promise<void> {
    await prisma.subscription.delete({
      where: { workshopId },
    })
  }
}
