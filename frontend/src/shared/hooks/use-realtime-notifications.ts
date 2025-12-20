import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { useSnackbar } from './use-snackbar'

interface Order {
  id: string
  userId: string
  totalAmount: number
  createdAt: string
  user?: {
    name?: string
    email: string
  }
}

/**
 * Hook para notificaciones en tiempo real de nuevos pedidos
 * Usa polling cada 10 segundos para detectar nuevos pedidos
 */
export const useRealtimeNotifications = () => {
  const { user } = useAuth()
  const { showInfo } = useSnackbar()
  const [unreadCount, setUnreadCount] = useState(0)
  const lastCheckedRef = useRef<Date>(new Date())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Inicializar sonido de notificación
  useEffect(() => {
    // Crear audio element con un beep simple
    audioRef.current = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTQIHm...'
    )
    audioRef.current.volume = 0.3
  }, [])

  useEffect(() => {
    // Solo hacer polling si el usuario es WORKSHOP_OWNER
    if (user?.role !== 'WORKSHOP_OWNER') return

    const checkNewOrders = async () => {
      try {
        // Obtener los talleres del usuario
        const workshopsResponse = await fetch('http://localhost:4000/api/owner/workshops/mine', {
          credentials: 'include',
        })

        if (!workshopsResponse.ok) return

        const workshops = await workshopsResponse.json()
        if (workshops.length === 0) return

        const workshopId = workshops[0].id

        // Obtener pedidos desde la última comprobación
        const ordersResponse = await fetch(
          `http://localhost:4000/api/owner/workshops/${workshopId}/orders`,
          {
            credentials: 'include',
          }
        )

        if (!ordersResponse.ok) return

        const orders: Order[] = await ordersResponse.json()

        // Filtrar pedidos nuevos (creados después de la última comprobación)
        const newOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate > lastCheckedRef.current
        })

        // Si hay pedidos nuevos, mostrar notificación
        if (newOrders.length > 0) {
          setUnreadCount((prev) => prev + newOrders.length)

          // Reproducir sonido
          audioRef.current?.play().catch(() => {
            // Ignorar errores de autoplay (necesita interacción del usuario primero)
          })

          // Mostrar snackbar para cada pedido nuevo
          newOrders.forEach((order) => {
            const customerName = order.user?.name || order.user?.email || 'Cliente'
            const amount = new Intl.NumberFormat('es-ES', {
              style: 'currency',
              currency: 'EUR',
            }).format(order.totalAmount / 100)

            showInfo(`🔔 Nuevo pedido de ${customerName} por ${amount}`)
          })
        }

        // Actualizar última comprobación
        lastCheckedRef.current = new Date()
      } catch (error) {
        console.error('[REALTIME] Error checking new orders:', error)
      }
    }

    // Comprobar inmediatamente
    checkNewOrders()

    // Luego cada 10 segundos
    const interval = setInterval(checkNewOrders, 10000)

    return () => clearInterval(interval)
  }, [user, showInfo])

  const clearUnread = () => {
    setUnreadCount(0)
  }

  return {
    unreadCount,
    clearUnread,
  }
}
