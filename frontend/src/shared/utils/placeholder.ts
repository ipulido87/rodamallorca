/**
 * Placeholder SVG data URLs para imágenes rotas o sin imagen.
 * - Branded con los colores de RodaMallorca
 * - Relevante al tipo de contenido (ícono + color por tipo de bici)
 * - Sin dependencias externas, sin peticiones de red
 */

type BikeType = 'road' | 'mountain' | 'hybrid' | 'ebike' | 'gravel' | 'city' | string

const GRADIENTS: Record<string, [string, string]> = {
  road:     ['#b71c1c', '#e53935'],
  mountain: ['#4e342e', '#795548'],
  gravel:   ['#558b2f', '#7cb342'],
  ebike:    ['#0d47a1', '#1976d2'],
  hybrid:   ['#00695c', '#00897b'],
  city:     ['#4527a0', '#7b1fa2'],
  product:  ['#1a6b3c', '#2d9e5f'],
  default:  ['#1a6b3c', '#2d9e5f'],
}

// Paths SVG simplificados por tipo
const ICONS: Record<string, string> = {
  road:     // bici de carretera (manillar caído)
    `<path d="M168,120 a52,52 0 1,0 104,0 a52,52 0 1,0 -104,0" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <path d="M328,120 a52,52 0 1,0 104,0 a52,52 0 1,0 -104,0" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="220" y1="120" x2="332" y2="120" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="220" y1="120" x2="255" y2="80" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="255" y1="80" x2="290" y2="90" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="332" y1="120" x2="310" y2="72" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="310" y1="72" x2="330" y2="65" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>`,
  ebike:
    `<path d="M168,120 a52,52 0 1,0 104,0 a52,52 0 1,0 -104,0" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <path d="M328,120 a52,52 0 1,0 104,0 a52,52 0 1,0 -104,0" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="220" y1="120" x2="332" y2="120" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <polyline points="290,70 270,100 295,100 275,130" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="10" stroke-linejoin="round"/>`,
  default:
    `<path d="M168,120 a52,52 0 1,0 104,0 a52,52 0 1,0 -104,0" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <path d="M328,120 a52,52 0 1,0 104,0 a52,52 0 1,0 -104,0" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="220" y1="120" x2="332" y2="120" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="220" y1="120" x2="255" y2="80" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="332" y1="120" x2="295" y2="75" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="295" y1="75" x2="255" y2="80" stroke="rgba(255,255,255,0.7)" stroke-width="12"/>
     <line x1="295" y1="75" x2="310" y2="60" stroke="rgba(255,255,255,0.7)" stroke-width="10"/>
     <line x1="310" y1="60" x2="330" y2="62" stroke="rgba(255,255,255,0.7)" stroke-width="10"/>`,
}

function buildSvg(type: string, w: number, h: number): string {
  const [c1, c2] = GRADIENTS[type] ?? GRADIENTS.default
  const icon = ICONS[type] ?? ICONS.default
  const label: Record<string, string> = {
    road: 'Carretera', mountain: 'Montaña', gravel: 'Gravel',
    ebike: 'Eléctrica', hybrid: 'Híbrida', city: 'Ciudad',
    product: 'Producto', default: 'Bicicleta',
  }
  const text = label[type] ?? 'Bicicleta'

  const cx = w / 2
  const cy = h / 2

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <g transform="translate(${cx - 250},${cy - 100}) scale(1)">
    ${icon}
  </g>
  <text x="${cx}" y="${cy + 95}" text-anchor="middle"
    fill="rgba(255,255,255,0.6)" font-family="system-ui,sans-serif"
    font-size="16" font-weight="600" letter-spacing="3" text-transform="uppercase">
    ${text.toUpperCase()}
  </text>
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const cache = new Map<string, string>()

export function getPlaceholderUrl(
  _id: string,
  type: BikeType | 'product' = 'default',
  width = 800,
  height = 600,
): string {
  const key = `${type}-${width}-${height}`
  if (!cache.has(key)) cache.set(key, buildSvg(type, width, height))
  return cache.get(key)!
}

export function getWorkshopPlaceholder(_id: string, size = 120): string {
  const key = `workshop-${size}`
  if (!cache.has(key)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#1a6b3c" rx="${size / 2}"/>
  <text x="${size / 2}" y="${size * 0.65}" text-anchor="middle"
    fill="rgba(255,255,255,0.85)" font-family="system-ui,sans-serif"
    font-size="${size * 0.4}" font-weight="bold">🔧</text>
</svg>`
    cache.set(key, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
  }
  return cache.get(key)!
}

/**
 * Handler onError — cambia src a placeholder SVG inline.
 * img.onerror = null previene bucle infinito.
 */
export function onImageError(
  e: React.SyntheticEvent<HTMLImageElement>,
  id: string,
  type: BikeType | 'product' = 'default',
  width = 800,
  height = 600,
): void {
  const img = e.currentTarget
  img.onerror = null
  img.src = getPlaceholderUrl(id, type, width, height)
}
