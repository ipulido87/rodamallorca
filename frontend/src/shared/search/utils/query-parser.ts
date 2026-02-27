import type { ParsedQuery } from '../types'

// Ciudades de Mallorca reconocibles en queries naturales
const MALLORCA_CITIES: Record<string, string> = {
  palma: 'Palma',
  'palma de mallorca': 'Palma',
  soller: 'Sóller',
  sóller: 'Sóller',
  alcudia: 'Alcúdia',
  alcúdia: 'Alcúdia',
  pollenca: 'Pollença',
  pollença: 'Pollença',
  inca: 'Inca',
  manacor: 'Manacor',
  felanitx: 'Felanitx',
  llucmajor: 'Llucmajor',
  calvia: 'Calvià',
  calvià: 'Calvià',
  marratxi: 'Marratxí',
  marratxí: 'Marratxí',
  santanyi: 'Santanyí',
  santanyí: 'Santanyí',
  andratx: 'Andratx',
  campos: 'Campos',
  artá: 'Artà',
  arta: 'Artà',
  porreres: 'Porreres',
  petra: 'Petra',
  muro: 'Muro',
  bunyola: 'Bunyola',
  esporles: 'Esporles',
  puigpunyent: 'Puigpunyent',
  deia: 'Deià',
  deià: 'Deià',
  valldemossa: 'Valldemossa',
  binissalem: 'Binissalem',
  selva: 'Selva',
  sineu: 'Sineu',
  montuiri: 'Montuïri',
  montuïri: 'Montuïri',
  vilafranca: 'Vilafranca',
  capdepera: 'Capdepera',
  'son servera': 'Son Servera',
  'sant llorenc': "Sant Llorenç",
  'cala ratjada': 'Cala Ratjada',
  'cala millor': 'Cala Millor',
  portocolom: 'Portocolom',
}

const USED_HINTS = [
  'usado', 'usada', 'usados', 'usadas',
  'segunda mano', 'de segunda', '2a mano',
  'segunda', 'segunda mano', 'ocasion', 'ocasión',
  'seminuevo', 'seminueva',
]

const NEW_HINTS = [
  'nuevo', 'nueva', 'nuevos', 'nuevas', 'a estrenar',
]

const CHEAP_HINTS = [
  'barato', 'barata', 'baratos', 'baratas',
  'economico', 'económico', 'economica', 'económica',
  'precio bajo', 'precios bajos', 'asequible',
  'baratito', 'baratita',
]

const EXPENSIVE_HINTS = [
  'caro', 'cara', 'caros', 'caras',
  'premium', 'de calidad', 'profesional', 'high end',
]

const RATING_HINTS = [
  'mejor valorado', 'mejor puntuado', 'mejor nota',
  'mas valorado', 'más valorado', 'top', 'mejor',
]

const NEWEST_HINTS = [
  'reciente', 'recientes', 'nuevo primero', 'últimos', 'ultimos',
]

// Extrae precio de frases como "menos de 50", "hasta 100€", "menos de 50 euros"
const extractPrice = (text: string): { maxPrice?: number; minPrice?: number } => {
  const maxMatch = text.match(/(?:menos de|hasta|maximo|máximo|por menos de)\s*(\d+)\s*(?:€|euros?|eur)?/i)
  const minMatch = text.match(/(?:mas de|más de|minimo|mínimo|desde|a partir de)\s*(\d+)\s*(?:€|euros?|eur)?/i)

  return {
    maxPrice: maxMatch ? parseInt(maxMatch[1], 10) : undefined,
    minPrice: minMatch ? parseInt(minMatch[1], 10) : undefined,
  }
}

// Normaliza el texto: lowercase, sin tildes para comparación
const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const containsAny = (text: string, hints: string[]): boolean =>
  hints.some((hint) => normalize(text).includes(normalize(hint)))

// Extrae ciudad mencionada en el texto
const extractCity = (text: string): string | undefined => {
  const normalized = normalize(text)
  for (const [key, value] of Object.entries(MALLORCA_CITIES)) {
    if (normalized.includes(normalize(key))) return value
  }
  return undefined
}

// Limpia el texto de palabras funcionales para dejar solo el término de búsqueda real
const cleanQuery = (text: string, city?: string): string => {
  let cleaned = text.toLowerCase()

  // Eliminar ciudad detectada
  if (city) {
    const cityVariants = Object.entries(MALLORCA_CITIES)
      .filter(([, v]) => v === city)
      .map(([k]) => k)
    cityVariants.forEach((variant) => {
      cleaned = cleaned.replace(new RegExp(variant, 'gi'), '')
    })
    cleaned = cleaned.replace(/\b(en|cerca de|en la zona de|de)\b/gi, '')
  }

  // Eliminar palabras funcionales de precio/condición/orden
  const stopWords = [
    ...USED_HINTS, ...NEW_HINTS, ...CHEAP_HINTS, ...EXPENSIVE_HINTS,
    ...RATING_HINTS, ...NEWEST_HINTS,
    'quiero', 'busco', 'necesito', 'dame', 'muéstrame', 'muestrame',
    'un', 'una', 'unos', 'unas', 'el', 'la', 'los', 'las',
    'de', 'para', 'con', 'que', 'sea', 'por',
    'menos de', 'hasta', 'máximo', 'maximo', 'mínimo', 'minimo',
    'mas de', 'más de', 'desde', 'a partir de',
    '€', 'euros', 'eur',
  ]

  stopWords.forEach((word) => {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), '')
  })

  // Eliminar números sueltos (precios ya extraídos)
  cleaned = cleaned.replace(/\b\d+\b/g, '')

  return cleaned.replace(/\s+/g, ' ').trim()
}

// Palabras clave que indican el usuario busca un taller/servicio
const TALLER_HINTS = [
  'taller', 'talleres', 'mecánico', 'mecanico', 'mecánica', 'mecanica',
  'reparar', 'reparación', 'reparacion', 'arreglar', 'revisión', 'revision',
  'servicio', 'servicios', 'mantenimiento', 'ajuste', 'puesta a punto',
]

// Palabras clave que indican alquiler
const ALQUILER_HINTS = [
  'alquilar', 'alquiler', 'alquilo', 'alquilaría', 'rental', 'rent',
  'reservar', 'reserva', 'arrendar',
]

export type SearchIntent = 'talleres' | 'productos' | 'alquiler'

/**
 * Detecta la intención de búsqueda del usuario.
 * Devuelve 'talleres', 'productos' o 'alquiler'.
 */
export const detectIntent = (input: string): SearchIntent => {
  if (containsAny(input, ALQUILER_HINTS)) return 'alquiler'
  if (containsAny(input, TALLER_HINTS)) return 'talleres'
  return 'productos'
}

/**
 * Parsea una query en lenguaje natural español y extrae parámetros de búsqueda estructurados.
 *
 * Ejemplos:
 *   "freno shimano barato segunda mano palma" → { q: "freno shimano", city: "Palma", condition: "used", sort: "price_asc" }
 *   "taller cerca de sóller bien valorado"    → { q: "taller", city: "Sóller", sort: "rating_desc" }
 *   "llanta menos de 50 euros"               → { q: "llanta", maxPrice: 50 }
 */
export const parseQuery = (input: string): ParsedQuery => {
  if (!input.trim()) return { q: '' }

  const city = extractCity(input)
  const { maxPrice, minPrice } = extractPrice(input)

  const condition: ParsedQuery['condition'] = containsAny(input, USED_HINTS)
    ? 'used'
    : containsAny(input, NEW_HINTS)
    ? 'new'
    : undefined

  const sort: ParsedQuery['sort'] = containsAny(input, RATING_HINTS)
    ? 'rating_desc'
    : containsAny(input, NEWEST_HINTS)
    ? 'newest'
    : containsAny(input, CHEAP_HINTS)
    ? 'price_asc'
    : containsAny(input, EXPENSIVE_HINTS)
    ? 'price_desc'
    : undefined

  const q = cleanQuery(input, city)

  return { q, city, condition, sort, maxPrice, minPrice }
}
