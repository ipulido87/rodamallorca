// Mock Prisma Client for tests when Prisma isn't generated
module.exports = {
  PrismaClient: class PrismaClient {
    constructor() {
      this.order = {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }
      this.workshop = {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }
      this.user = {
        create: jest.fn(),
        findUnique: jest.fn(),
      }
    }
  },
  Prisma: {
    OrderGetPayload: {},
  },
  $Enums: {
    OrderStatus: {
      PENDING: 'PENDING',
      CONFIRMED: 'CONFIRMED',
      IN_PROGRESS: 'IN_PROGRESS',
      READY: 'READY',
      COMPLETED: 'COMPLETED',
      CANCELLED: 'CANCELLED',
    },
    OrderType: {
      PRODUCT_ORDER: 'PRODUCT_ORDER',
      RENTAL_ORDER: 'RENTAL_ORDER',
    },
    PaymentStatus: {
      PENDING: 'PENDING',
      PAID: 'PAID',
      REFUNDED: 'REFUNDED',
      FAILED: 'FAILED',
    },
  },
  UserRole: {
    USER: 'USER',
    WORKSHOP_OWNER: 'WORKSHOP_OWNER',
    ADMIN: 'ADMIN',
  },
}
