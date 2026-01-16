import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Servicio para gestionar la disponibilidad de alquiler de bicicletas
 */

interface AvailabilityCheck {
  productId: string
  startDate: Date
  endDate: Date
  quantity?: number
}

interface RentalPriceCalculation {
  productId: string
  startDate: Date
  endDate: Date
}

/**
 * Verifica si un producto está disponible para alquilar en las fechas especificadas
 */
export async function checkAvailability({
  productId,
  startDate,
  endDate,
  quantity = 1,
}: AvailabilityCheck): Promise<{
  available: boolean
  availableQuantity: number
  conflictingReservations?: number
}> {
  console.log(`🔍 [Rental] Verificando disponibilidad para producto ${productId}`)
  console.log(`📅 Fechas: ${startDate.toISOString()} - ${endDate.toISOString()}`)

  // Obtener el producto
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product || !product.isRental) {
    throw new Error('Producto no encontrado o no es de alquiler')
  }

  console.log(`📦 Producto: ${product.title}, Cantidad disponible: ${product.availableQuantity}`)

  // Buscar reservas conflictivas (órdenes confirmadas que se solapan con las fechas)
  const conflictingReservations = await prisma.orderItem.findMany({
    where: {
      productId,
      isRental: true,
      order: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'], // Estados que bloquean disponibilidad
        },
      },
      // Verificar solapamiento de fechas:
      // Nueva reserva empieza antes de que termine una existente
      // Y termina después de que empiece una existente
      AND: [
        {
          rentalStartDate: {
            lte: endDate, // Reserva existente empieza antes/cuando termina la nueva
          },
        },
        {
          rentalEndDate: {
            gte: startDate, // Reserva existente termina después/cuando empieza la nueva
          },
        },
      ],
    },
    include: {
      order: true,
    },
  })

  console.log(`📊 Reservas conflictivas: ${conflictingReservations.length}`)

  // Calcular cuántas unidades están reservadas
  const reservedQuantity = conflictingReservations.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const availableQuantity = product.availableQuantity - reservedQuantity

  console.log(`✅ Cantidad disponible: ${availableQuantity} (total: ${product.availableQuantity}, reservadas: ${reservedQuantity})`)

  return {
    available: availableQuantity >= quantity,
    availableQuantity,
    conflictingReservations: conflictingReservations.length,
  }
}

/**
 * Calcula el precio total del alquiler basado en las fechas
 */
export async function calculateRentalPrice({
  productId,
  startDate,
  endDate,
}: RentalPriceCalculation): Promise<{
  days: number
  pricePerDay: number
  pricePerWeek?: number
  totalPrice: number
  deposit?: number
  breakdown: string
}> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product || !product.isRental || !product.rentalPricePerDay) {
    throw new Error('Producto no encontrado o no tiene precio de alquiler')
  }

  // Calcular días
  const diffTime = endDate.getTime() - startDate.getTime()
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (days < product.minRentalDays) {
    throw new Error(`El alquiler mínimo es de ${product.minRentalDays} días`)
  }

  if (days > product.maxRentalDays) {
    throw new Error(`El alquiler máximo es de ${product.maxRentalDays} días`)
  }

  // Calcular precio
  let totalPrice = 0
  let breakdown = ''

  // Si hay precio semanal y alquila 7+ días, aplicar descuento
  if (product.rentalPricePerWeek && days >= 7) {
    const weeks = Math.floor(days / 7)
    const remainingDays = days % 7

    totalPrice = weeks * product.rentalPricePerWeek + remainingDays * product.rentalPricePerDay
    breakdown = `${weeks} semana${weeks > 1 ? 's' : ''} (${product.rentalPricePerWeek / 100}€) + ${remainingDays} día${remainingDays !== 1 ? 's' : ''} (${product.rentalPricePerDay / 100}€/día)`
  } else {
    totalPrice = days * product.rentalPricePerDay
    breakdown = `${days} día${days !== 1 ? 's' : ''} × ${product.rentalPricePerDay / 100}€/día`
  }

  console.log(`💰 [Rental] Precio calculado: ${totalPrice / 100}€ (${breakdown})`)

  return {
    days,
    pricePerDay: product.rentalPricePerDay,
    pricePerWeek: product.rentalPricePerWeek || undefined,
    totalPrice,
    deposit: product.depositAmount || undefined,
    breakdown,
  }
}

/**
 * Obtiene todas las fechas bloqueadas para un producto
 * Útil para mostrar en el calendario
 */
export async function getBlockedDates(productId: string): Promise<
  Array<{
    startDate: Date
    endDate: Date
    quantityBlocked: number
  }>
> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product || !product.isRental) {
    throw new Error('Producto no encontrado o no es de alquiler')
  }

  // Obtener todas las reservas activas
  const reservations = await prisma.orderItem.findMany({
    where: {
      productId,
      isRental: true,
      order: {
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
        },
      },
      rentalStartDate: { not: null },
      rentalEndDate: { not: null },
    },
    include: {
      order: true,
    },
    orderBy: {
      rentalStartDate: 'asc',
    },
  })

  // Agrupar por rango de fechas
  const blockedDates = reservations.map((item) => ({
    startDate: item.rentalStartDate!,
    endDate: item.rentalEndDate!,
    quantityBlocked: item.quantity,
  }))

  return blockedDates
}
