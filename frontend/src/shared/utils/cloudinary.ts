/**
 * Cloudinary image optimization utility.
 *
 * Injects transformation parameters into existing Cloudinary URLs to serve
 * the correct size and format for each usage context without changing the
 * existing upload pipeline.
 *
 * Presets:
 *  - thumbnail  → catalog grid cards (w_400, h_300, fill, f_auto, q_auto)
 *  - catalog    → medium list view   (w_800, h_600, fill, f_auto, q_auto)
 *  - detail     → product/rental detail hero (w_1200, limit, f_auto, q_80)
 *  - logo       → workshop logos in listings  (w_120, h_120, fill, f_auto, q_auto)
 *  - og         → Open Graph images (w_1200, h_630, fill, f_auto, q_80)
 */

const PRESETS = {
  thumbnail: 'c_fill,w_400,h_300,f_auto,q_auto',
  catalog:   'c_fill,w_800,h_600,f_auto,q_auto',
  detail:    'c_limit,w_1200,f_auto,q_80',
  logo:      'c_fill,w_120,h_120,f_auto,q_auto',
  og:        'c_fill,w_1200,h_630,f_auto,q_80',
} as const

export type CloudinaryPreset = keyof typeof PRESETS

const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/'

export function getOptimizedImageUrl(
  url: string | null | undefined,
  preset: CloudinaryPreset,
): string {
  if (!url) return '/placeholder-bike.jpg'
  if (!url.includes('res.cloudinary.com')) return url

  const uploadIndex = url.indexOf(CLOUDINARY_UPLOAD_SEGMENT)
  if (uploadIndex === -1) return url

  const base = url.slice(0, uploadIndex + CLOUDINARY_UPLOAD_SEGMENT.length)
  const rest = url.slice(uploadIndex + CLOUDINARY_UPLOAD_SEGMENT.length)

  // Avoid double-injecting: if rest starts with a known transformation (not a version "v123")
  const alreadyTransformed = /^[a-z]_/.test(rest)
  if (alreadyTransformed) return url

  return `${base}${PRESETS[preset]}/${rest}`
}
