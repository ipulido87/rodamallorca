import type { WorkshopRepository } from '../../workshops/domain/repositories/workshop-repository'
import type { ProductRepository } from '../../products/domain/repositories/product-repository'
import type { PaymentGateway } from '../domain/services/payment-gateway'
import { calculateApplicationFee } from '../services/stripe-connect.service'

interface Dependencies {
  workshopRepo: WorkshopRepository
  productRepo: ProductRepository
  paymentGateway: PaymentGateway
}

export interface CartItem {
  productId: string
  quantity: number
  priceAtOrder: number
  currency: string
  description?: string
  // Campos de alquiler
  isRental?: boolean
  rentalStartDate?: string
  rentalEndDate?: string
  rentalDays?: number
  depositPaid?: number
}

export interface CreateCheckoutInput {
  userId: string
  userEmail: string
  workshopId: string
  items: CartItem[]
  successUrl: string
  cancelUrl: string
}

/**
 * Crea una sesión de Checkout de Stripe para compra de productos
 * Usa Stripe Connect para enviar el pago al taller (menos comisión)
 */
export async function createProductCheckoutSession(
  input: CreateCheckoutInput,
  deps: Dependencies
) {
  const { userId, userEmail, workshopId, items, successUrl, cancelUrl } = input
  const { workshopRepo, productRepo, paymentGateway } = deps

  const workshop = await workshopRepo.findByIdWithStripe(workshopId)

  if (!workshop) {
    throw new Error('Taller no encontrado')
  }

  if (!workshop.stripeConnectedAccountId) {
    throw new Error('El taller no tiene configurado Stripe Connect. No puede recibir pagos.')
  }

  try {
    const account = await paymentGateway.getConnectedAccount(workshop.stripeConnectedAccountId)

    // Verificar si el onboarding está completo en Stripe
    const onboardingComplete = account.detailsSubmitted && account.chargesEnabled && account.payoutsEnabled

    // Si el onboarding está completo en Stripe pero no en la BD, actualizar
    if (onboardingComplete && !workshop.stripeOnboardingComplete) {
      await workshopRepo.updateStripeAccount(workshopId, workshop.stripeConnectedAccountId, true)
    }

    // Si el onboarding NO está completo, bloquear el pago
    if (!onboardingComplete) {
      await workshopRepo.updateStripeAccount(workshopId, workshop.stripeConnectedAccountId, false)

      throw new Error(
        'El taller aún no ha completado la verificación de Stripe. ' +
        'Por favor, completa la configuración de pagos en tu panel de control para poder vender productos.'
      )
    }

  } catch (error: unknown) {
    const errObj = error instanceof Error ? error : null
    const errCode = errObj && 'code' in errObj ? (errObj as Record<string, unknown>).code : undefined
    const errType = errObj && 'type' in errObj ? (errObj as Record<string, unknown>).type : undefined
    const errMsg = errObj?.message ?? ''

    const isInvalidAccount =
      errCode === 'resource_missing' ||
      errType === 'StripeInvalidRequestError' ||
      errMsg.includes('does not have access to account') ||
      errMsg.includes('Application access may have been revoked')

    if (isInvalidAccount) {
      await workshopRepo.updateStripeAccount(workshopId, null, false)

      throw new Error(
        'La cuenta de pagos del taller ya no es válida o ha sido desconectada. ' +
        'El propietario debe reconectar Stripe Connect desde su panel de control.'
      )
    }

    throw error
  }

  // Validar que todos los productos existen
  const productIds = items.map((item) => item.productId)
  const products = await productRepo.findByIds(productIds)

  if (products.length !== productIds.length) {
    throw new Error('Algunos productos no existen')
  }

  const totalAmount = items.reduce((sum, item) => sum + item.priceAtOrder * item.quantity, 0)
  const applicationFee = calculateApplicationFee(totalAmount)

  // Crear line items para gateway
  const lineItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`)

    // Si es alquiler, agregar fechas a la descripción
    let description = item.description || product.description || ''
    if (item.isRental && item.rentalStartDate && item.rentalEndDate) {
      const startDate = new Date(item.rentalStartDate).toLocaleDateString('es-ES')
      const endDate = new Date(item.rentalEndDate).toLocaleDateString('es-ES')
      description = `Alquiler: ${startDate} - ${endDate} (${item.rentalDays} días)${description ? ' | ' + description : ''}`
    }

    return {
      priceData: {
        currency: item.currency,
        unitAmount: item.priceAtOrder, // Ya está en centavos
        productData: {
          name: product.title,
          description: description || undefined,
        },
      },
      quantity: item.quantity,
    }
  })

  // ⭐ Crear sesión de Checkout con Stripe Connect
  try {
    const session = await paymentGateway.createCheckoutSession({
      mode: 'payment',
      paymentMethodTypes: ['card', 'revolut_pay'],
      lineItems,
      successUrl,
      cancelUrl,
      customerEmail: userEmail,
      applicationFeeAmount: applicationFee,
      transferDestination: workshop.stripeConnectedAccountId!,
      metadata: {
        userId,
        workshopId,
        workshopName: workshop.name,
        items: JSON.stringify(
          items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtOrder: item.priceAtOrder,
            currency: item.currency,
            description: item.description,
            // ✅ Campos de alquiler
            isRental: item.isRental,
            rentalStartDate: item.rentalStartDate,
            rentalEndDate: item.rentalEndDate,
            rentalDays: item.rentalDays,
            depositPaid: item.depositPaid,
          }))
        ),
      },
    })

    return {
      sessionId: session.id,
      url: session.url,
    }
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : ''
    const errCode = error instanceof Error && 'code' in error
      ? (error as Record<string, unknown>).code
      : undefined

    if (
      errMsg.includes('No such destination') ||
      errMsg.includes('account that is not connected') ||
      errCode === 'account_invalid'
    ) {
      await workshopRepo.updateStripeAccount(workshopId, null, false)

      throw new Error(
        'La cuenta de pagos del taller no es válida. ' +
        'Se ha desconectado automáticamente. El propietario debe reconectar Stripe Connect.'
      )
    }

    throw error
  }
}
