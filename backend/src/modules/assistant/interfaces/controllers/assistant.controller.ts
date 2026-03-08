import type { Request, Response, NextFunction } from 'express'
import prisma from '../../../../lib/prisma'

interface AssistantChatBody {
  message?: string
  conversationId?: string
}

type AssistantIntent =
  | 'workshops'
  | 'products'
  | 'rentals'
  | 'services'
  | 'support'
  | 'general'

interface AssistantChatResponse {
  conversationId: string
  intent: AssistantIntent
  reply: string
  suggestions: string[]
  escalated: boolean
  context?: {
    workshops?: Array<{ id: string; name: string; city: string | null }>
    products?: Array<{ id: string; title: string; price: number }>
    rentals?: Array<{ id: string; title: string; price: number }>
    services?: Array<{ id: string; name: string; workshopName: string }>
  }
}

function detectIntent(message: string): AssistantIntent {
  const normalized = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (/soporte|incidencia|problema|error|no funciona|ticket|issue|humano/.test(normalized)) {
    return 'support'
  }
  if (/alquil|rent|reserva/.test(normalized)) return 'rentals'
  if (/servicio|puesta a punto|mantenimiento/.test(normalized)) return 'services'
  if (/comprar|producto|recambio|pieza|casco|freno|cadena|llanta/.test(normalized)) return 'products'
  if (/taller|repar|mecanic|arreglar|revision/.test(normalized)) return 'workshops'

  return 'general'
}

function extractCity(message: string): string | undefined {
  const normalized = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const cities = [
    'palma', 'soller', 'alcudia', 'pollenca', 'inca', 'manacor', 'felanitx',
    'llucmajor', 'calvia', 'andratx', 'muro', 'can pastilla', 'santa ponsa',
  ]

  const found = cities.find((city) => normalized.includes(city))
  return found ? found.replace(/\b\w/g, (c) => c.toUpperCase()) : undefined
}

function buildConversationId(): string {
  return `asst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

async function searchWorkshops(city?: string) {
  return prisma.workshop.findMany({
    where: {
      isListed: true,
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    },
    select: { id: true, name: true, city: true },
    orderBy: { averageRating: 'desc' },
    take: 4,
  })
}

async function searchProducts(city?: string) {
  return prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      isRental: false,
      ...(city ? { workshop: { city: { contains: city, mode: 'insensitive' } } } : {}),
    },
    select: { id: true, title: true, price: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })
}

async function searchRentals(city?: string) {
  return prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      isRental: true,
      ...(city ? { workshop: { city: { contains: city, mode: 'insensitive' } } } : {}),
    },
    select: { id: true, title: true, price: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })
}

async function searchServices(city?: string) {
  return prisma.service.findMany({
    where: {
      status: 'ACTIVE',
      ...(city ? { workshop: { city: { contains: city, mode: 'insensitive' } } } : {}),
    },
    select: {
      id: true,
      name: true,
      workshop: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })
}

export const assistantChatController = async (
  req: Request<unknown, unknown, AssistantChatBody>,
  res: Response<AssistantChatResponse | { error: string }>,
  next: NextFunction
) => {
  try {
    const message = req.body?.message?.trim()
    if (!message) {
      return res.status(400).json({ error: 'El campo message es requerido' })
    }

    const conversationId = req.body.conversationId || buildConversationId()
    const intent = detectIntent(message)
    const city = extractCity(message)

    const supportEmail = process.env.SUPPORT_EMAIL || 'info@rodamallorca.com'

    if (intent === 'support') {
      return res.json({
        conversationId,
        intent,
        escalated: true,
        reply: `Te ayudo a escalarlo con soporte. Escríbenos a ${supportEmail} incluyendo qué pasó y, si puedes, una captura de pantalla.`,
        suggestions: [
          'Reportar error en pago',
          'No puedo publicar mi taller',
          'Tengo un problema con una reserva',
        ],
      })
    }

    if (intent === 'workshops') {
      const workshops = await searchWorkshops(city)
      const cityText = city ? ` en ${city}` : ''
      return res.json({
        conversationId,
        intent,
        escalated: false,
        reply: workshops.length
          ? `He encontrado ${workshops.length} talleres${cityText}. Te muestro los más relevantes.`
          : `Ahora mismo no veo talleres${cityText}. ¿Quieres que ampliemos la búsqueda sin ciudad?`,
        suggestions: ['Ver talleres mejor valorados', 'Buscar talleres cercanos', 'Escalar a soporte'],
        context: { workshops },
      })
    }

    if (intent === 'products') {
      const products = await searchProducts(city)
      return res.json({
        conversationId,
        intent,
        escalated: false,
        reply: products.length
          ? `Te encontré ${products.length} productos publicados${city ? ` en ${city}` : ''}.`
          : 'No encontré productos con ese filtro. Puedo probar con términos más amplios.',
        suggestions: ['Ver recambios baratos', 'Buscar por ciudad', 'Escalar a soporte'],
        context: { products },
      })
    }

    if (intent === 'rentals') {
      const rentals = await searchRentals(city)
      return res.json({
        conversationId,
        intent,
        escalated: false,
        reply: rentals.length
          ? `Hay ${rentals.length} opciones de alquiler${city ? ` en ${city}` : ''}.`
          : 'No encontré alquileres con ese criterio.',
        suggestions: ['Ver bicis eléctricas', 'Ver alquiler por día', 'Escalar a soporte'],
        context: { rentals },
      })
    }

    if (intent === 'services') {
      const services = await searchServices(city)
      const formatted = services.map((s) => ({
        id: s.id,
        name: s.name,
        workshopName: s.workshop.name,
      }))

      return res.json({
        conversationId,
        intent,
        escalated: false,
        reply: formatted.length
          ? `Encontré ${formatted.length} servicios activos${city ? ` en ${city}` : ''}.`
          : 'No encontré servicios con ese filtro por ahora.',
        suggestions: ['Buscar puesta a punto', 'Buscar mantenimiento', 'Escalar a soporte'],
        context: { services: formatted },
      })
    }

    return res.json({
      conversationId,
      intent: 'general',
      escalated: false,
      reply: 'Puedo ayudarte a encontrar talleres, productos, alquileres o servicios. Cuéntame qué necesitas y en qué zona.',
      suggestions: [
        'Necesito un taller en Palma',
        'Quiero alquilar una bici de carretera',
        'Busco recambios baratos',
      ],
    })
  } catch (error) {
    next(error)
  }
}
