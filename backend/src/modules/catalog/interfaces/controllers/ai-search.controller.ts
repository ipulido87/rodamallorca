import type { NextFunction, Request, Response } from 'express'
import prisma from '../../../../lib/prisma'

/**
 * Búsqueda inteligente con IA usando la API gratuita de Gemini.
 *
 * Tier gratuito de Gemini: 15 RPM, 1M tokens/día — más que suficiente.
 * Alternativa: funciona sin API key con búsqueda semántica local (fallback).
 *
 * Flujo:
 * 1. Usuario escribe en lenguaje natural: "necesito arreglar mi bici en Palma"
 * 2. Gemini interpreta la intención y genera filtros estructurados
 * 3. Se ejecuta la query en Prisma con los filtros generados
 * 4. Se devuelve la respuesta con contexto de IA
 */

interface AiSearchResult {
  intent: 'workshops' | 'products' | 'services' | 'rentals' | 'routes'
  filters: {
    q?: string
    city?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    vehicleType?: string
  }
  aiMessage?: string // Respuesta contextual de la IA
  results: unknown[]
  total: number
}

// ─── Cache simple en memoria para evitar llamadas repetidas a Gemini ─────────

const cache = new Map<string, { data: AiSearchResult; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

function getCached(key: string): AiSearchResult | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: AiSearchResult): void {
  // Limitar tamaño del cache
  if (cache.size > 500) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, { data, timestamp: Date.now() })
}

// ─── Llamada a Gemini API ──────────────────────────────────────────────────────

async function callGemini(query: string): Promise<{
  intent: AiSearchResult['intent']
  filters: AiSearchResult['filters']
  aiMessage: string
} | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const prompt = `Eres un asistente de búsqueda para RodaMallorca, un marketplace de bicicletas en Mallorca, España.

Analiza esta consulta del usuario y devuelve un JSON con la estructura indicada. NO devuelvas nada más que JSON válido.

Consulta: "${query}"

Responde con este JSON exacto:
{
  "intent": "workshops" | "products" | "services" | "rentals" | "routes",
  "filters": {
    "q": "término de búsqueda limpio (sin ciudad, sin palabras funcionales)",
    "city": "ciudad detectada o null",
    "category": "categoría del producto/servicio o null",
    "minPrice": número o null,
    "maxPrice": número o null
  },
  "aiMessage": "Una respuesta corta y útil en español explicando qué se encontró, máximo 1 frase"
}

Reglas:
- intent "workshops" si busca taller, reparación, mecánico, arreglar, revisión
- intent "products" si busca comprar componentes, recambios, piezas
- intent "rentals" si busca alquilar bicicleta
- intent "routes" si busca rutas ciclistas
- intent "services" si busca un servicio específico (puesta a punto, etc.)
- Las ciudades son de Mallorca: Palma, Sóller, Alcúdia, Pollença, Inca, Manacor, etc.
- aiMessage debe ser empático y útil, como un guía local`

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
            maxOutputTokens: 300,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    if (!response.ok) {
      console.warn(`Gemini API error: ${response.status}`)
      return null
    }

    const data: any = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null

    return JSON.parse(text)
  } catch (error) {
    console.warn('Gemini API call failed:', (error as Error).message)
    return null
  }
}

// ─── Fallback: parsing local (sin IA) ──────────────────────────────────────────

function localParse(query: string): {
  intent: AiSearchResult['intent']
  filters: AiSearchResult['filters']
  aiMessage: string
} {
  const normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Detectar intención
  let intent: AiSearchResult['intent'] = 'workshops'
  if (/alquil|rent|reservar/.test(normalized)) intent = 'rentals'
  else if (/ruta|camino|recorrido|tramuntana|calobra|formentor/.test(normalized)) intent = 'routes'
  else if (/comprar|recambio|pieza|componente|casco|llanta|freno|cadena|pedal|sillin|manillar/.test(normalized)) intent = 'products'
  else if (/taller|reparar|arreglar|mecanico|revision|mantenimiento|puesta a punto|ajust/.test(normalized)) intent = 'workshops'
  else if (/servicio|puesta a punto/.test(normalized)) intent = 'services'

  // Detectar ciudad
  const cityMap: Record<string, string> = {
    palma: 'Palma', soller: 'Sóller', alcudia: 'Alcúdia',
    pollenca: 'Pollença', inca: 'Inca', manacor: 'Manacor',
    felanitx: 'Felanitx', llucmajor: 'Llucmajor', calvia: 'Calvià',
    andratx: 'Andratx', campos: 'Campos', arta: 'Artà',
    sineu: 'Sineu', binissalem: 'Binissalem', capdepera: 'Capdepera',
    santanyi: 'Santanyí', porreres: 'Porreres', muro: 'Muro',
    'sa pobla': 'Sa Pobla', campanet: 'Campanet', sencelles: 'Sencelles',
    'can pastilla': 'Can Pastilla', magaluf: 'Magaluf',
    'santa ponsa': 'Santa Ponsa', 'cala millor': 'Cala Millor',
    'puerto de pollenca': 'Puerto de Pollença',
    'puerto de alcudia': 'Puerto de Alcúdia',
    'port de soller': 'Port de Sóller',
    'colonia de sant jordi': 'Colònia de Sant Jordi',
  }

  let city: string | undefined
  for (const [key, value] of Object.entries(cityMap)) {
    if (normalized.includes(key)) {
      city = value
      break
    }
  }

  // Extraer precio
  const maxMatch = normalized.match(/(?:menos de|hasta|maximo)\s*(\d+)/)
  const minMatch = normalized.match(/(?:mas de|desde|minimo)\s*(\d+)/)

  // Limpiar query de stop words
  let cleanQ = normalized
    .replace(/\b(quiero|necesito|busco|dame|muestrame|hay|tiene|donde|como|puedo)\b/g, '')
    .replace(/\b(un|una|unos|unas|el|la|los|las|de|en|para|con|que|sea|por|mi|su|cerca)\b/g, '')
    .replace(/\b(taller|talleres|alquilar|alquiler|reparar|reparacion|arreglar|mecanico|servicio)\b/g, '')
    .replace(/\b(barato|caro|usado|nuevo|mejor|valorado)\b/g, '')
  // Remove city from search query
  if (city) {
    for (const [key] of Object.entries(cityMap)) {
      if (normalized.includes(key)) {
        cleanQ = cleanQ.replace(new RegExp(key, 'g'), '')
      }
    }
  }
  cleanQ = cleanQ.replace(/\d+/g, '').replace(/[€$]/g, '').replace(/\s+/g, ' ').trim()

  const intentLabels: Record<string, string> = {
    workshops: 'talleres',
    products: 'productos',
    services: 'servicios',
    rentals: 'opciones de alquiler',
    routes: 'rutas',
  }

  const aiMessage = city
    ? `Buscando ${intentLabels[intent]} en ${city}...`
    : `Mostrando ${intentLabels[intent]} en Mallorca`

  return {
    intent,
    filters: {
      q: cleanQ || undefined,
      city,
      maxPrice: maxMatch ? parseInt(maxMatch[1]) : undefined,
      minPrice: minMatch ? parseInt(minMatch[1]) : undefined,
    },
    aiMessage,
  }
}

// ─── Ejecutar búsqueda en DB ───────────────────────────────────────────────────

async function executeSearch(
  intent: AiSearchResult['intent'],
  filters: AiSearchResult['filters']
): Promise<{ results: unknown[]; total: number }> {
  const take = 20

  switch (intent) {
    case 'workshops': {
      const where = {
        isListed: true,
        ...(filters.q ? {
          OR: [
            { name: { contains: filters.q, mode: 'insensitive' as const } },
            { description: { contains: filters.q, mode: 'insensitive' as const } },
          ]
        } : {}),
        ...(filters.city ? { city: { contains: filters.city, mode: 'insensitive' as const } } : {}),
      }
      const [items, total] = await Promise.all([
        prisma.workshop.findMany({ where, take, orderBy: { averageRating: 'desc' } }),
        prisma.workshop.count({ where }),
      ])
      return { results: items, total }
    }

    case 'products': {
      const where = {
        status: 'PUBLISHED' as const,
        isRental: false,
        ...(filters.q ? {
          OR: [
            { title: { contains: filters.q, mode: 'insensitive' as const } },
            { description: { contains: filters.q, mode: 'insensitive' as const } },
          ]
        } : {}),
        ...(filters.city ? { workshop: { city: { contains: filters.city, mode: 'insensitive' as const } } } : {}),
        ...(filters.minPrice || filters.maxPrice ? {
          price: {
            ...(filters.minPrice ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
          }
        } : {}),
      }
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            workshop: { select: { id: true, name: true, city: true } },
            category: { select: { id: true, name: true } },
            images: true,
          },
        }),
        prisma.product.count({ where }),
      ])
      return { results: items, total }
    }

    case 'rentals': {
      const where = {
        status: 'PUBLISHED' as const,
        isRental: true,
        ...(filters.q ? {
          OR: [
            { title: { contains: filters.q, mode: 'insensitive' as const } },
            { description: { contains: filters.q, mode: 'insensitive' as const } },
          ]
        } : {}),
        ...(filters.city ? { workshop: { city: { contains: filters.city, mode: 'insensitive' as const } } } : {}),
      }
      const [items, total] = await Promise.all([
        prisma.product.findMany({
          where,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            workshop: { select: { id: true, name: true, city: true } },
            images: true,
          },
        }),
        prisma.product.count({ where }),
      ])
      return { results: items, total }
    }

    case 'services': {
      const where = {
        status: 'ACTIVE' as const,
        ...(filters.q ? {
          OR: [
            { name: { contains: filters.q, mode: 'insensitive' as const } },
            { description: { contains: filters.q, mode: 'insensitive' as const } },
          ]
        } : {}),
        ...(filters.city ? { workshop: { city: { contains: filters.city, mode: 'insensitive' as const } } } : {}),
      }
      const [items, total] = await Promise.all([
        prisma.service.findMany({
          where,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            workshop: { select: { id: true, name: true, city: true } },
            serviceCategory: { select: { id: true, name: true, icon: true } },
          },
        }),
        prisma.service.count({ where }),
      ])
      return { results: items, total }
    }

    case 'routes':
    default:
      return { results: [], total: 0 }
  }
}

// ─── Controller ────────────────────────────────────────────────────────────────

export const aiSearchController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q?.toString()?.trim()
    if (!query) {
      return res.status(400).json({ error: 'El parámetro q es requerido' })
    }

    // Revisar cache
    const cacheKey = query.toLowerCase()
    const cached = getCached(cacheKey)
    if (cached) {
      return res.json(cached)
    }

    // Intentar con Gemini, fallback a parsing local
    const parsed = await callGemini(query) ?? localParse(query)

    // Ejecutar búsqueda en DB
    const { results, total } = await executeSearch(parsed.intent, parsed.filters)

    const response: AiSearchResult = {
      intent: parsed.intent,
      filters: parsed.filters,
      aiMessage: parsed.aiMessage,
      results,
      total,
    }

    setCache(cacheKey, response)
    res.json(response)
  } catch (e) {
    next(e)
  }
}
