import { useEffect } from 'react'

interface SeoProps {
  title: string
  description: string
  keywords?: string
  canonicalPath?: string
  robots?: string
  structuredData?: Record<string, unknown>
}

const BASE_URL = 'https://rodamallorca.com'

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? BASE_URL).replace(/\/+$/, '')

const normalizePath = (path: string) => {
  if (!path.startsWith('/')) {
    return `/${path}`
  }

  return path
}

export const Seo = ({
  title,
  description,
  keywords,
  canonicalPath,
  robots = 'index,follow',
  structuredData,
}: SeoProps) => {
  useEffect(() => {
    document.title = title

    const buildCanonicalUrl = () => {
      if (canonicalPath) {
        return `${SITE_URL}${normalizePath(canonicalPath)}`
      }

      return `${SITE_URL}${window.location.pathname}`
    }

    const canonicalUrl = buildCanonicalUrl()

    const setMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let tag = document.querySelector(`meta[${attribute}="${name}"]`)

      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attribute, name)
        document.head.appendChild(tag)
      }

      tag.setAttribute('content', content)
    }

    setMetaTag('description', description)
    setMetaTag('robots', robots)

    if (keywords) {
      setMetaTag('keywords', keywords)
    } else {
      document.querySelector('meta[name="keywords"]')?.remove()
    }

    setMetaTag('og:title', title, 'property')
    setMetaTag('og:description', description, 'property')
    setMetaTag('og:type', 'website', 'property')
    setMetaTag('og:locale', 'es_ES', 'property')
    setMetaTag('og:site_name', 'RodaMallorca', 'property')
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', title)
    setMetaTag('twitter:description', description)

    let canonicalTag = document.querySelector('link[rel="canonical"]')

    if (!canonicalTag) {
      canonicalTag = document.createElement('link')
      canonicalTag.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalTag)
    }

    canonicalTag.setAttribute('href', canonicalUrl)
    setMetaTag('og:url', canonicalUrl, 'property')

    let structuredDataTag: HTMLScriptElement | null = null

    if (structuredData) {
      document.querySelectorAll('script[data-seo-structured-data="true"]').forEach((tag) => {
        tag.remove()
      })

      structuredDataTag = document.createElement('script')
      structuredDataTag.type = 'application/ld+json'
      structuredDataTag.text = JSON.stringify(structuredData)
      structuredDataTag.setAttribute('data-seo-structured-data', 'true')
      document.head.appendChild(structuredDataTag)
    }

    return () => {
      if (structuredDataTag) {
        structuredDataTag.remove()
      }
    }
  }, [canonicalPath, description, keywords, robots, structuredData, title])

  return null
}
