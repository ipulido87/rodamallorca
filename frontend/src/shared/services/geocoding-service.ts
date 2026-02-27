const CACHE_KEY = 'roda_geocode_cache'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 días

interface CacheEntry {
  lat: number
  lng: number
  timestamp: number
}

interface GeocodingCache {
  [address: string]: CacheEntry
}

// Colas para respetar el rate limit de Nominatim (1 req/s)
let lastRequestTime = 0
const MIN_INTERVAL_MS = 1100

const readCache = (): GeocodingCache => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as GeocodingCache) : {}
  } catch {
    return {}
  }
}

const writeCache = (cache: GeocodingCache): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // localStorage lleno — ignorar silenciosamente
  }
}

const fromCache = (key: string): { lat: number; lng: number } | null => {
  const cache = readCache()
  const entry = cache[key]
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null
  return { lat: entry.lat, lng: entry.lng }
}

const toCache = (key: string, lat: number, lng: number): void => {
  const cache = readCache()
  cache[key] = { lat, lng, timestamp: Date.now() }
  writeCache(cache)
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Geocodifica una dirección usando Nominatim (OpenStreetMap). Gratuito, sin API key.
 * Caché en localStorage con TTL de 7 días para no repetir peticiones.
 * Rate limit: 1 req/s (política de uso aceptable de Nominatim).
 *
 * @returns { lat, lng } o null si no se encuentra
 */
export const geocodeAddress = async (
  address: string,
  city?: string,
  country = 'Spain'
): Promise<{ lat: number; lng: number } | null> => {
  const queryParts = [address, city, 'Mallorca', country].filter(Boolean)
  const fullQuery = queryParts.join(', ')
  const cacheKey = fullQuery.toLowerCase()

  // 1. Intentar desde caché
  const cached = fromCache(cacheKey)
  if (cached) return cached

  // 2. Respetar rate limit
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < MIN_INTERVAL_MS) {
    await wait(MIN_INTERVAL_MS - elapsed)
  }

  // 3. Petición a Nominatim
  try {
    lastRequestTime = Date.now()
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullQuery)}&format=json&limit=1&countrycodes=es`

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'es',
        'User-Agent': 'RodaMallorca/1.0 (https://rodamallorca.es)',
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    if (!data.length) return null

    const { lat, lon } = data[0]
    const coords = { lat: parseFloat(lat), lng: parseFloat(lon) }

    toCache(cacheKey, coords.lat, coords.lng)
    return coords
  } catch {
    return null
  }
}

/**
 * Geocodifica múltiples direcciones en secuencia, respetando el rate limit.
 * Devuelve un Map de índice → coords (los no encontrados no están en el Map).
 */
export const geocodeBatch = async <T extends { address?: string; city?: string }>(
  items: T[]
): Promise<Map<number, { lat: number; lng: number }>> => {
  const result = new Map<number, { lat: number; lng: number }>()

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const coords = await geocodeAddress(item.address ?? '', item.city)
    if (coords) result.set(i, coords)
  }

  return result
}
