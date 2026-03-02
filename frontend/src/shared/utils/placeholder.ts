/**
 * Placeholder image utility using Picsum Photos (picsum.photos).
 * - Deterministic: el mismo seed siempre da la misma imagen
 * - Sin API key, gratuito, estable
 * - Cada item tiene su propia imagen consistente
 */

type BikeType = 'road' | 'mountain' | 'hybrid' | 'ebike' | 'gravel' | 'city' | string

const BIKE_SEEDS: Record<string, number[]> = {
  road:     [10, 28, 42, 56, 70],
  mountain: [15, 29, 37, 55, 68],
  gravel:   [11, 23, 45, 57, 71],
  ebike:    [12, 30, 44, 58, 72],
  hybrid:   [13, 24, 43, 59, 69],
  city:     [14, 25, 41, 60, 67],
  product:  [17, 27, 39, 53, 65],
  default:  [16, 26, 38, 52, 66],
}

const WORKSHOP_SEEDS = [20, 31, 48, 62, 75]

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0
  }
  return h
}

export function getPlaceholderUrl(
  id: string,
  type: BikeType | 'workshop' | 'product' = 'default',
  width = 800,
  height = 600,
): string {
  const seeds = BIKE_SEEDS[type] ?? BIKE_SEEDS.default
  const seed = seeds[hashId(id) % seeds.length]
  return `https://picsum.photos/seed/${seed}-${id.slice(0, 8)}/${width}/${height}`
}

export function getWorkshopPlaceholder(id: string, size = 120): string {
  const seed = WORKSHOP_SEEDS[hashId(id) % WORKSHOP_SEEDS.length]
  return `https://picsum.photos/seed/ws-${seed}-${id.slice(0, 8)}/${size}/${size}`
}

/**
 * Handler onError para <img> y CardMedia.
 * Cambia el src al placeholder sin bucle infinito.
 */
export function onImageError(
  e: React.SyntheticEvent<HTMLImageElement>,
  id: string,
  type: BikeType | 'workshop' | 'product' = 'default',
  width = 800,
  height = 600,
): void {
  const img = e.currentTarget
  img.onerror = null
  img.src = getPlaceholderUrl(id, type, width, height)
}
