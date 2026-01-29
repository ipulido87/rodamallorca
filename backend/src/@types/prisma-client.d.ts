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
    export type ServiceWhereInput = any
    export type ReviewWhereInput = any
    export type InvoiceWhereInput = any
    export type CustomerWhereInput = any
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
    export enum UserRole {
      USER = 'USER',
      WORKSHOP_OWNER = 'WORKSHOP_OWNER',
      ADMIN = 'ADMIN',
    }
    export enum VehicleType {
      BICYCLE = 'BICYCLE',
      E_BIKE = 'E_BIKE',
      E_SCOOTER = 'E_SCOOTER',
      ALL = 'ALL',
    }
    export enum ServiceStatus {
      ACTIVE = 'ACTIVE',
      INACTIVE = 'INACTIVE',
    }
    export enum InvoiceStatus {
      DRAFT = 'DRAFT',
      SENT = 'SENT',
      PAID = 'PAID',
      OVERDUE = 'OVERDUE',
      CANCELLED = 'CANCELLED',
    }
    export enum CustomerType {
      INDIVIDUAL = 'INDIVIDUAL',
      BUSINESS = 'BUSINESS',
    }
  }

  export type UserRole = $Enums.UserRole
  export type VehicleType = $Enums.VehicleType
  export type ServiceStatus = $Enums.ServiceStatus
  export type InvoiceStatus = $Enums.InvoiceStatus
  export type CustomerType = $Enums.CustomerType

  export const UserRole: typeof $Enums.UserRole
  export const VehicleType: typeof $Enums.VehicleType
  export const ServiceStatus: typeof $Enums.ServiceStatus
  export const InvoiceStatus: typeof $Enums.InvoiceStatus
  export const CustomerType: typeof $Enums.CustomerType
  export const OrderStatus: typeof $Enums.OrderStatus
  export const OrderType: typeof $Enums.OrderType
  export const SubscriptionStatus: typeof $Enums.SubscriptionStatus

  export const Prisma: typeof Prisma
}
