import webpush from 'web-push'
import prisma from '../../../lib/prisma'

// Configurar VAPID keys desde variables de entorno
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  console.log('✅ [PUSH] Web Push configurado correctamente')
} else {
  console.warn('⚠️  [PUSH] VAPID keys no configuradas. Push notifications deshabilitadas.')
  console.log('💡 [PUSH] Ejecuta: npx tsx src/scripts/generate-vapid-keys.ts')
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface NewOrderPushData {
  orderNumber: string
  customerName: string
  totalAmount: string
  itemsCount: number
}

/**
 * Envía notificación push al taller cuando recibe un nuevo pedido
 */
export const sendNewOrderPush = async (
  workshopId: string,
  data: NewOrderPushData
): Promise<void> => {
  try {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn('⚠️  [PUSH] VAPID keys no configuradas. Push notification no enviada.')
      return
    }

    // Obtener todas las suscripciones del taller
    // Nota: Necesitaremos crear una tabla PushSubscription en el futuro
    // Por ahora, esto es un placeholder
    const subscriptions = await getPushSubscriptions(workshopId)

    if (subscriptions.length === 0) {
      console.log(`ℹ️  [PUSH] No hay suscripciones activas para el taller ${workshopId}`)
      return
    }

    const payload = JSON.stringify({
      title: '🔔 Nuevo Pedido Recibido',
      body: `${data.customerName} ha realizado un pedido de ${data.totalAmount}`,
      icon: '/logo-192.png',
      badge: '/badge-72.png',
      data: {
        url: `/workshop-orders`,
        orderNumber: data.orderNumber,
        type: 'new-order',
      },
    })

    // Enviar notificación a todas las suscripciones
    const results = await Promise.allSettled(
      subscriptions.map((subscription) =>
        webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
          },
          payload
        )
      )
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    console.log(
      `✅ [PUSH] Push notifications enviadas: ${successful} exitosas, ${failed} fallidas`
    )

    // Limpiar suscripciones inválidas
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        const error = result.reason as any
        if (error.statusCode === 410) {
          // Suscripción expirada, eliminarla
          console.log(`🗑️  [PUSH] Eliminando suscripción expirada`)
          // TODO: Implementar eliminación de suscripción
        }
      }
    })
  } catch (error) {
    console.error('❌ [PUSH] Error enviando push notification:', error)
    // No lanzar error para no bloquear la creación del pedido
  }
}

/**
 * Obtiene las suscripciones push de un taller
 * TODO: Implementar con base de datos cuando se cree la tabla PushSubscription
 */
async function getPushSubscriptions(workshopId: string): Promise<PushSubscription[]> {
  // Placeholder - En el futuro esto consultará la base de datos
  // Por ahora retornamos array vacío
  return []
}

/**
 * Guarda una nueva suscripción push
 */
export const savePushSubscription = async (
  workshopId: string,
  userId: string,
  subscription: PushSubscription
): Promise<void> => {
  try {
    // TODO: Implementar guardado en base de datos
    // Por ahora solo logeamos
    console.log(
      `📥 [PUSH] Nueva suscripción recibida para taller ${workshopId}, usuario ${userId}`
    )
    console.log('Subscription:', JSON.stringify(subscription, null, 2))
  } catch (error) {
    console.error('❌ [PUSH] Error guardando suscripción:', error)
    throw error
  }
}

/**
 * Elimina una suscripción push
 */
export const removePushSubscription = async (
  workshopId: string,
  endpoint: string
): Promise<void> => {
  try {
    // TODO: Implementar eliminación de base de datos
    console.log(`🗑️  [PUSH] Suscripción eliminada para taller ${workshopId}`)
  } catch (error) {
    console.error('❌ [PUSH] Error eliminando suscripción:', error)
    throw error
  }
}

/**
 * Obtiene la clave pública VAPID para el cliente
 */
export const getVapidPublicKey = (): string => {
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('VAPID_PUBLIC_KEY no configurada')
  }
  return VAPID_PUBLIC_KEY
}
