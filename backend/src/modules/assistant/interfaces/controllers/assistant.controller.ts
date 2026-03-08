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

interface AssistantContext {
  workshops?: Array<{ id: string; name: string; city: string | null }>
  products?: Array<{ id: string; title: string; price: number }>
  rentals?: Array<{ id: string; title: string; price: number }>
  services?: Array<{ id: string; name: string; workshopName: string }>
}

interface AssistantChatResponse {
  conversationId: string
  intent: AssistantIntent
  reply: string
  suggestions: string[]
  escalated: boolean
  context?: AssistantContext
}

interface ParsedInput {
  intent: AssistantIntent
  city?: string
  q?: string
  needsSupport: boolean
}

const STOP_WORDS = new Set([
  'quiero', 'necesito', 'busco', 'dame', 'muestrame', 'hay', 'tiene', 'donde', 'como', 'puedo',
  'un', 'una', 'unos', 'unas', 'el', 'la', 'los', 'las', 'de', 'en', 'para', 'con', 'que', 'sea',
  'por', 'mi', 'su', 'cerca', 'favor', 'porfa', 'me', 'ayuda', 'ayudar',
])

const CITY_MAP: Record<string, string> = {
  palma: 'Palma', soller: 'Sóller', alcudia: 'Alcúdia', pollenca: 'Pollença',
  inca: 'Inca', manacor: 'Manacor', felanitx: 'Felanitx', llucmajor: 'Llucmajor',
  calvia: 'Calvià', andratx: 'Andratx', campos: 'Campos', arta: 'Artà',
  sineu: 'Sineu', binissalem: 'Binissalem', capdepera: 'Capdepera',
  santanyi: 'Santanyí', porreres: 'Porreres', muro: 'Muro',
  'sa pobla': 'Sa Pobla', campanet: 'Campanet', sencelles: 'Sencelles',
  'can pastilla': 'Can Pastilla', magaluf: 'Magaluf', 'santa ponsa': 'Santa Ponsa',
  'cala millor': 'Cala Millor', 'puerto de pollenca': 'Puerto de Pollença',
  'puerto de alcudia': 'Puerto de Alcúdia', 'port de soller': 'Port de Sóller',
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function detectIntent(message: string): AssistantIntent {
  const normalized = normalize(message)

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
  const normalized = normalize(message)
  const found = Object.entries(CITY_MAP).find(([key]) => normalized.includes(key))
  return found?.[1]
}

function extractCleanQuery(message: string, city?: string): string | undefined {
  const normalized = normalize(message)
  const cityTokens = city ? Object.keys(CITY_MAP).filter((key) => CITY_MAP[key] === city) : []

  const words = normalized
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9ñ]/g, ''))
    .filter(Boolean)
    .filter((word) => !STOP_WORDS.has(word))
    .filter((word) => !cityTokens.some((token) => token.split(' ').includes(word)))

  const q = words.join(' ').trim()
  return q || undefined
}

async function parseWithGemini(message: string): Promise<ParsedInput | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const prompt = `Analiza la consulta y devuelve SOLO JSON válido:
{
  "intent": "workshops|products|rentals|services|support|general",
  "city": "string|null",
  "q": "terminos utiles sin relleno|''",
  "needsSupport": true|false
}

Consulta: "${message}"

Reglas:
- support si menciona error, problema, incidencia o quiere ayuda humana
- workshops para taller/reparación/mecánico
- products para compra/recambios
- rentals para alquiler/reserva
- services para servicios de taller
- city solo si está clara
- q debe ser corta y útil para filtrar`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 180,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) return null

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null

    const parsed = JSON.parse(text) as {
      intent?: AssistantIntent
      city?: string | null
      q?: string
      needsSupport?: boolean
    }

    return {
      intent: parsed.intent ?? 'general',
      city: parsed.city || undefined,
      q: parsed.q?.trim() || undefined,
      needsSupport: Boolean(parsed.needsSupport),
    }
  } catch {
    return null
  }
}

function buildConversationId(): string {
  return `asst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

async function searchWorkshops(city?: string, q?: string) {
  return prisma.workshop.findMany({
    where: {
      isListed: true,
      ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    select: { id: true, name: true, city: true },
    orderBy: { averageRating: 'desc' },
    take: 4,
  })
}

async function searchProducts(city?: string, q?: string) {
  return prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      isRental: false,
      ...(city ? { workshop: { city: { contains: city, mode: 'insensitive' } } } : {}),
      ...(q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    select: { id: true, title: true, price: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })
}

async function searchRentals(city?: string, q?: string) {
  return prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      isRental: true,
      ...(city ? { workshop: { city: { contains: city, mode: 'insensitive' } } } : {}),
      ...(q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
    },
    select: { id: true, title: true, price: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  })
}

async function searchServices(city?: string, q?: string) {
  return prisma.service.findMany({
    where: {
      status: 'ACTIVE',
      ...(city ? { workshop: { city: { contains: city, mode: 'insensitive' } } } : {}),
      ...(q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
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

    const localIntent = detectIntent(message)
    const localCity = extractCity(message)
    const localQ = extractCleanQuery(message, localCity)
    const geminiParsed = await parseWithGemini(message)

    const intent = geminiParsed?.intent ?? localIntent
    const city = geminiParsed?.city ?? localCity
    const q = geminiParsed?.q ?? localQ
    const needsSupport = geminiParsed?.needsSupport || intent === 'support'

    const supportEmail = process.env.SUPPORT_EMAIL || 'info@rodamallorca.com'

    if (needsSupport) {
      return res.json({
        conversationId,
        intent: 'support',
        escalated: true,
        reply: `Entendido, lo escalamos. Escríbenos a ${supportEmail} con el error, pasos para reproducirlo y captura de pantalla. Si quieres, te ayudo a redactarlo ahora.`,
        suggestions: [
          'Tuve un error en pago',
          'No puedo publicar mi taller',
          'No me deja reservar alquiler',
        ],
      })
    }

    if (intent === 'workshops') {
      const workshops = await searchWorkshops(city, q)
      const topNames = workshops.slice(0, 2).map((workshop) => workshop.name).join(' y ')
      return res.json({
        conversationId,
        intent,
        escalated: false,
        reply: workshops.length
          ? `Te encontré ${workshops.length} talleres${city ? ` en ${city}` : ''}${topNames ? `, por ejemplo ${topNames}.` : '.'}`
          : `No veo talleres${city ? ` en ${city}` : ''} con ese criterio. ¿Probamos sin ciudad o con otra consulta?`,
        suggestions: ['Ver talleres mejor valorados', 'Buscar taller sin ciudad', 'Hablar con soporte'],
        context: { workshops },
      })
    }

    if (intent === 'products') {
      const products = await searchProducts(city, q)
      return res.json({
        conversationId,
        intent,
        escalated: false,
        reply: products.length
          ? `Encontré ${products.length} productos${city ? ` en ${city}` : ''}. Te muestro opciones recientes.`
          : 'No encontré productos con ese filtro. Puedo ampliar por categoría o ciudad.',
        suggestions: ['Ver recambios baratos', 'Buscar productos en Palma', 'Hablar con soporte'],
        context: { products },
      })
    }

    if (intent === 'rentals') {
      const rentals = await searchRentals(city, q)
      return res.json({
        conversationId,
        intent,
        escalated: false,
        reply: rentals.length
          ? `Hay ${rentals.length} opciones de alquiler${city ? ` en ${city}` : ''}.`
          : 'No veo alquileres con ese criterio. ¿Quieres probar sin ciudad o por tipo de bici?',
        suggestions: ['Alquiler en Palma', 'Bici eléctrica de alquiler', 'Hablar con soporte'],
        context: { rentals },
      })
    }

    if (intent === 'services') {
      const services = await searchServices(city, q)
      const formatted = services.map((service) => ({
        id: service.id,
        name: service.name,
        workshopName: service.workshop.name,
      }))

      return res.json({
        conversationId,
        intent,
        escalated: false,
        reply: formatted.length
          ? `Te encontré ${formatted.length} servicios activos${city ? ` en ${city}` : ''}.`
          : 'No encontré servicios con esos términos. Podemos ampliar la búsqueda.',
        suggestions: ['Puesta a punto', 'Mantenimiento completo', 'Hablar con soporte'],
        context: { services: formatted },
      })
    }

    return res.json({
      conversationId,
      intent: 'general',
      escalated: false,
      reply: 'Puedo ayudarte con talleres, productos, alquileres y servicios. Si prefieres, también escalo incidencias a soporte.',
      suggestions: [
        'Necesito un taller en Palma',
        'Quiero alquilar una bici de carretera',
        'Tuve un error en la web',
      ],
    })
  } catch (error) {
    next(error)
  }
}
