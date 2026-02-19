import { Helmet } from 'react-helmet-async'

interface SeoProps {
  title: string
  description: string
  keywords?: string
  canonicalPath?: string
  robots?: string
  image?: string
  ogType?: string
  structuredData?: Record<string, unknown> | Record<string, unknown>[]
}

const BASE_URL = 'https://rodamallorca.es'
const SITE_URL = (import.meta.env.VITE_SITE_URL ?? BASE_URL).replace(/\/+$/, '')
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`)

export const Seo = ({
  title,
  description,
  keywords,
  canonicalPath,
  robots = 'index,follow',
  image,
  ogType = 'website',
  structuredData,
}: SeoProps) => {
  const canonicalUrl = canonicalPath
    ? `${SITE_URL}${normalizePath(canonicalPath)}`
    : SITE_URL

  const ogImage = image ?? DEFAULT_OG_IMAGE

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:site_name" content="RodaMallorca" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}
