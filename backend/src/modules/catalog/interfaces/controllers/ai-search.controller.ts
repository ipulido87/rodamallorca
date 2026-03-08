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

type SearchIntent = 'workshops' | 'products' | 'services' | 'rentals' | 'routes'

interface SearchFilters {
  q?: string
  city?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  vehicleType?: string
}

interface AiSearchResult {
  intent: SearchIntent
  filters: SearchFilters
  aiMessage?: string
  results: unknown[]
  total: number
}

interface ParsedIntent {
  intent: SearchIntent
  filters: SearchFilters
  aiMessage: string
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
}

interface GeminiParsedResult {
  intent?: string
  filters?: {
    q?: string
    city?: string | null
    category?: string | null
    minPrice?: number | null
    maxPrice?: number | null
  }
  aiMessage?: string
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000
const MAX_CACHE_SIZE = 500
const MAX_RESULTS = 20
const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

const VALID_INTENTS: ReadonlySet<string> = new Set([
  'workshops', 'products', 'services', 'rentals', 'routes',
])

const MALLORCA_CITIES: Readonly<Record<string, string>> = {
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

const INTENT_LABELS: Readonly<Record<SearchIntent, string>> = {
  workshops: 'talleres',
  products: 'productos',
  services: 'servicios',
  rentals: 'opciones de alquiler',
  routes: 'rutas',
}

// ─── Cache simple en memoria para evitar llamadas repetidas a Gemini ─────────

const cache = new Map<string, { data: AiSearchResult; timestamp: number }>()

function getCached(key: string): AiSearchResult | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: AiSearchResult): void {
  if (cache.size > MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value
    if (firstKey !== undefined) cache.delete(firstKey)
  }
  cache.set(key, { data, timestamp: Date.now() })
}

// ─── Llamada a Gemini API ──────────────────────────────────────────────────────

function buildGeminiPrompt(query: string): string {
  return `Eres un asistente experto de RodaMallorca, el marketplace líder de bicicletas en Mallorca, España. Tu trabajo es interpretar consultas de usuarios en lenguaje natural y convertirlas en parámetros de búsqueda estructurados.

Consulta del usuario: "${query}"

Responde SOLO con JSON válido con esta estructura exacta:
{
  "intent": "workshops|products|services|rentals|routes",
  "filters": {
    "q": "término de búsqueda limpio o cadena vacía",
    "city": "ciudad detectada o null",
    "category": "categoría o null",
    "minPrice": null,
    "maxPrice": null
  },
  "aiMessage": "respuesta breve y útil en español"
}

Reglas de clasificación de intención:
- "workshops": taller, reparación, mecánico, arreglar, revisión, mantenimiento, ajuste, cambiar rueda, pinchar
- "products": comprar, vender, componente, recambio, pieza, casco, llanta, freno, cadena, pedal, sillín, manillar, luz, cubierta, cámara, kit, herramienta
- "services": servicio específico, puesta a punto, cambio de aceite, ajuste de cambios, centrado de rueda
- "rentals": alquilar, alquiler, reservar bici, rentar
- "routes": ruta, recorrido, paseo, vuelta, Sa Calobra, Cap de Formentor, Serra de Tramuntana, ciclismo, pedalear

Reglas de extracción:
- "q": elimina palabras funcionales (quiero, busco, necesito, un, una, de, en, para), deja solo el término real de búsqueda. Si no hay término específico, usa cadena vacía
- "city": detecta municipios de Mallorca (Palma, Sóller, Alcúdia, Pollença, Inca, Manacor, Calvià, Llucmajor, Andratx, Campos, Artà, etc.)
- Precios: "menos de 50€" → maxPrice: 50, "desde 100" → minPrice: 100, "entre 50 y 200" → minPrice: 50, maxPrice: 200
- "aiMessage": sé empático, breve y útil. Ejemplo: "¡Genial! Te muestro talleres de confianza en Sóller 🔧"

Ejemplos:
- "necesito arreglar mi bici en Palma" → intent: "workshops", city: "Palma", aiMessage: "¡Aquí tienes talleres de confianza en Palma!"
- "casco de carretera menos de 80 euros" → intent: "products", q: "casco carretera", maxPrice: 80
- "quiero alquilar una ebike en Alcúdia" → intent: "rentals", city: "Alcúdia", q: "ebike"
- "ruta por la Tramuntana" → intent: "routes", q: "tramuntana"
- "puesta a punto completa Sóller" → intent: "services", city: "Sóller", q: "puesta a punto"`
}

function isValidIntent(value: string): value is SearchIntent {
  return VALID_INTENTS.has(value)
}

function validateGeminiResult(parsed: GeminiParsedResult): ParsedIntent | null {
  if (!parsed.intent || !isValidIntent(parsed.intent)) return null

  return {
    intent: parsed.intent,
    filters: {
      q: parsed.filters?.q || undefined,
      city: parsed.filters?.city ?? undefined,
      category: parsed.filters?.category ?? undefined,
      minPrice: typeof parsed.filters?.minPrice === 'number' ? parsed.filters.minPrice : undefined,
      maxPrice: typeof parsed.filters?.maxPrice === 'number' ? parsed.filters.maxPrice : undefined,
    },
    aiMessage: parsed.aiMessage || INTENT_LABELS[parsed.intent],
  }
}

async function callGemini(query: string): Promise<ParsedIntent | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const prompt = buildGeminiPrompt(query)

  try {
    const response = await fetch(
      `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
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

    if (!response.ok) return null

    const data: GeminiResponse = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null

    const parsed: GeminiParsedResult = JSON.parse(text)
    return validateGeminiResult(parsed)
  } catch {
    return null
  }
}

// ─── Fallback: parsing local (sin IA) ──────────────────────────────────────────

function normalizeText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function detectIntent(normalized: string): SearchIntent {
  if (/alquil|rent|reservar/.test(normalized)) return 'rentals'
  if (/ruta|camino|recorrido|tramuntana|calobra|formentor|paseo|vuelta/.test(normalized)) return 'routes'
  if (/comprar|recambio|pieza|componente|casco|llanta|freno|cadena|pedal|sillin|manillar|cubierta|camara|luz/.test(normalized)) return 'products'
  if (/servicio|puesta a punto|cambio de aceite|centrado/.test(normalized)) return 'services'
  return 'workshops'
}

function detectCity(normalized: string): string | undefined {
  // Buscar primero las ciudades compuestas (más largas) para evitar falsos positivos
  const sortedEntries = Object.entries(MALLORCA_CITIES).sort(
    ([a], [b]) => b.length - a.length
  )
  for (const [key, value] of sortedEntries) {
    if (normalized.includes(key)) return value
  }
  return undefined
}

function cleanSearchQuery(normalized: string, city: string | undefined): string {
  let cleanQ = normalized
    .replace(/\b(quiero|necesito|busco|dame|muestrame|hay|tiene|donde|como|puedo)\b/g, '')
    .replace(/\b(un|una|unos|unas|el|la|los|las|de|en|para|con|que|sea|por|mi|su|cerca)\b/g, '')
    .replace(/\b(taller|talleres|alquilar|alquiler|reparar|reparacion|arreglar|mecanico|servicio)\b/g, '')
    .replace(/\b(barato|caro|usado|nuevo|mejor|valorado)\b/g, '')
    .replace(/\b(menos de|hasta|maximo|mas de|desde|minimo)\b/g, '')

  if (city) {
    const sortedKeys = Object.entries(MALLORCA_CITIES)
      .filter(([, v]) => v === city)
      .map(([k]) => k)
      .sort((a, b) => b.length - a.length)
    for (const key of sortedKeys) {
      cleanQ = cleanQ.replace(new RegExp(key, 'g'), '')
    }
  }

  return cleanQ.replace(/\d+/g, '').replace(/[€$]/g, '').replace(/\s+/g, ' ').trim()
}

function localParse(query: string): ParsedIntent {
  const normalized = normalizeText(query)

  const intent = detectIntent(normalized)
  const city = detectCity(normalized)

  const maxMatch = normalized.match(/(?:menos de|hasta|maximo)\s*(\d+)/)
  const minMatch = normalized.match(/(?:mas de|desde|minimo)\s*(\d+)/)

  const cleanQ = cleanSearchQuery(normalized, city)

  const aiMessage = city
    ? `Buscando ${INTENT_LABELS[intent]} en ${city}...`
    : `Mostrando ${INTENT_LABELS[intent]} en Mallorca`

  return {
    intent,
    filters: {
      q: cleanQ || undefined,
      city,
      maxPrice: maxMatch ? parseInt(maxMatch[1], 10) : undefined,
      minPrice: minMatch ? parseInt(minMatch[1], 10) : undefined,
    },
    aiMessage,
  }
}

// ─── Ejecutar búsqueda en DB ───────────────────────────────────────────────────

function buildTextFilter(fields: string[], q: string) {
  return {
    OR: fields.map((field) => ({
      [field]: { contains: q, mode: 'insensitive' as const },
    })),
  }
}

function buildCityFilter(city: string, nested = false) {
  const filter = { contains: city, mode: 'insensitive' as const }
  return nested
    ? { workshop: { city: filter } }
    : { city: filter }
}

async function searchWorkshops(filters: SearchFilters) {
  const where = {
    isListed: true,
    ...(filters.q ? buildTextFilter(['name', 'description'], filters.q) : {}),
    ...(filters.city ? buildCityFilter(filters.city) : {}),
  }
  const [items, total] = await Promise.all([
    prisma.workshop.findMany({ where, take: MAX_RESULTS, orderBy: { averageRating: 'desc' } }),
    prisma.workshop.count({ where }),
  ])
  return { results: items, total }
}

async function searchProducts(filters: SearchFilters, isRental: boolean) {
  const where = {
    status: 'PUBLISHED' as const,
    isRental,
    ...(filters.q ? buildTextFilter(['title', 'description'], filters.q) : {}),
    ...(filters.city ? buildCityFilter(filters.city, true) : {}),
    ...(filters.minPrice || filters.maxPrice ? {
      price: {
        ...(filters.minPrice ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
      },
    } : {}),
  }
  const include = {
    workshop: { select: { id: true, name: true, city: true } },
    ...(!isRental ? { category: { select: { id: true, name: true } } } : {}),
    images: true,
  }
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, take: MAX_RESULTS, orderBy: { createdAt: 'desc' }, include }),
    prisma.product.count({ where }),
  ])
  return { results: items, total }
}

async function searchServices(filters: SearchFilters) {
  const where = {
    status: 'ACTIVE' as const,
    ...(filters.q ? buildTextFilter(['name', 'description'], filters.q) : {}),
    ...(filters.city ? buildCityFilter(filters.city, true) : {}),
  }
  const [items, total] = await Promise.all([
    prisma.service.findMany({
      where,
      take: MAX_RESULTS,
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

async function executeSearch(
  intent: SearchIntent,
  filters: SearchFilters
): Promise<{ results: unknown[]; total: number }> {
  switch (intent) {
    case 'workshops':
      return searchWorkshops(filters)
    case 'products':
      return searchProducts(filters, false)
    case 'rentals':
      return searchProducts(filters, true)
    case 'services':
      return searchServices(filters)
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
): Promise<void> => {
  try {
    const query = req.query.q?.toString()?.trim()
    if (!query) {
      res.status(400).json({ error: 'El parámetro q es requerido' })
      return
    }

    const cacheKey = query.toLowerCase()
    const cached = getCached(cacheKey)
    if (cached) {
      res.json(cached)
      return
    }

    const parsed = await callGemini(query) ?? localParse(query)
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
