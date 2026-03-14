/**
 * Registro centralizado de dependencias
 *
 * Este archivo configura todas las dependencias del sistema.
 * Debe ser llamado al inicio de la aplicación (en index.ts).
 */

import { container } from './container'

// Repositories (clases)
import { OrderRepositoryPrisma } from '../../modules/orders/infrastructure/persistence/prisma/order-repository-prisma'
import { WorkshopRepositoryPrisma } from '../../modules/workshops/infrastructure/persistence/prisma/workshop-repository-prisma'
import { UserRepositoryPrisma } from '../../modules/auth/infrastructure/persistence/prisma/user-repository-prisma'
import { ProductRepositoryPrisma } from '../../modules/products/infrastructure/persistence/prisma/product-repository-prisma'
import { ReviewRepositoryPrisma } from '../../modules/reviews/infrastructure/persistence/prisma/review-repository-prisma'

// Repositories (objetos singleton ya exportados)
import { favoriteRepositoryPrisma } from '../../modules/favorites/infrastructure/persistence/prisma/favorite-repository-prisma'
import { serviceRepositoryPrisma } from '../../modules/services/infrastructure/persistence/prisma/service-repository-prisma'
import { billingRepositoryPrisma } from '../../modules/billing/infrastructure/persistence/prisma/billing-repository-prisma'
import { customerRepositoryPrisma } from '../../modules/customers/infrastructure/persistence/prisma/customer-repository-prisma'

// Services/Adapters
import { JwtTokenService } from '../../modules/auth/infrastructure/adapters/jwt/token-service-impl'

// Keys para el contenedor (usar constantes para evitar typos)
export const DI_KEYS = {
  // Repositories
  ORDER_REPO: 'orderRepo',
  WORKSHOP_REPO: 'workshopRepo',
  USER_REPO: 'userRepo',
  PRODUCT_REPO: 'productRepo',
  REVIEW_REPO: 'reviewRepo',
  FAVORITE_REPO: 'favoriteRepo',
  SERVICE_REPO: 'serviceRepo',
  BILLING_REPO: 'billingRepo',
  CUSTOMER_REPO: 'customerRepo',

  // Services
  TOKEN_SERVICE: 'tokenService',
} as const

export function registerDependencies(): void {
  // Repositories (clases - creamos nuevas instancias)
  container.registerSingleton(DI_KEYS.ORDER_REPO, () => new OrderRepositoryPrisma())
  container.registerSingleton(DI_KEYS.WORKSHOP_REPO, () => new WorkshopRepositoryPrisma())
  container.registerSingleton(DI_KEYS.USER_REPO, () => new UserRepositoryPrisma())
  container.registerSingleton(DI_KEYS.PRODUCT_REPO, () => new ProductRepositoryPrisma())
  container.registerSingleton(DI_KEYS.REVIEW_REPO, () => new ReviewRepositoryPrisma())

  // Repositories (objetos ya exportados como singletons)
  container.registerSingleton(DI_KEYS.FAVORITE_REPO, () => favoriteRepositoryPrisma)
  container.registerSingleton(DI_KEYS.SERVICE_REPO, () => serviceRepositoryPrisma)
  container.registerSingleton(DI_KEYS.BILLING_REPO, () => billingRepositoryPrisma)
  container.registerSingleton(DI_KEYS.CUSTOMER_REPO, () => customerRepositoryPrisma)

  // Services
  container.registerSingleton(DI_KEYS.TOKEN_SERVICE, () => new JwtTokenService())

  console.log('✅ Dependencies registered in IoC container')
}

// Re-export container for convenience
export { container }
