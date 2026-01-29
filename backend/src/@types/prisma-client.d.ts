/**
 * Stub type definitions for @prisma/client when the client cannot be generated
 * This allows tests to compile in environments with network restrictions
 */
declare module '@prisma/client' {
  export class PrismaClient {
    constructor(options?: any)
    $connect(): Promise<void>
    $disconnect(): Promise<void>
    $on(eventType: any, callback: any): void
    $transaction<R>(fn: (prisma: any) => Promise<R>, options?: any): Promise<R>
    $executeRaw(query: any, ...values: any[]): Promise<number>
    $queryRaw(query: any, ...values: any[]): Promise<any>

    // Add any other Prisma client methods you need for your tests
    [key: string]: any
  }

  export namespace Prisma {
    export type OrderGetPayload<T> = any
    export type ProductGetPayload<T> = any
    export type WorkshopGetPayload<T> = any
    export type UserGetPayload<T> = any
    export type SubscriptionGetPayload<T> = any

    // Input types
    export type ProductWhereInput = any
    export type OrderWhereInput = any
    export type WorkshopWhereInput = any
    export type UserWhereInput = any

    // Add more as needed
    [key: string]: any
  }

  export namespace $Enums {
    export enum OrderStatus {
      PENDING = 'PENDING',
      CONFIRMED = 'CONFIRMED',
      IN_PROGRESS = 'IN_PROGRESS',
      READY = 'READY',
      COMPLETED = 'COMPLETED',
      CANCELLED = 'CANCELLED',
    }
    export enum OrderType {
      PRODUCT_ORDER = 'PRODUCT_ORDER',
      SERVICE_REPAIR = 'SERVICE_REPAIR',
      RENTAL = 'RENTAL',
    }
    export enum SubscriptionStatus {
      TRIALING = 'TRIALING',
      ACTIVE = 'ACTIVE',
      PAST_DUE = 'PAST_DUE',
      CANCELED = 'CANCELED',
      INCOMPLETE = 'INCOMPLETE',
      UNPAID = 'UNPAID',
    }
    // Add more enums as needed
  }

  export const Prisma: typeof Prisma
}
