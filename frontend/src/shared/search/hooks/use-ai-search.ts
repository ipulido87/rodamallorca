import { useCallback, useRef, useState } from 'react'
import {
  aiSearch,
  type AiSearchResponse,
} from '@/features/catalog/services/catalog-service'

interface UseAiSearchResult {
  query: string
  setQuery: (q: string) => void
  search: () => Promise<void>
  result: AiSearchResponse | null
  loading: boolean
  error: string | null
}

/**
 * Hook para búsqueda inteligente con IA.
 *
 * Llama al endpoint /api/catalog/ai-search que usa Gemini (gratis)
 * para interpretar consultas en lenguaje natural.
 *
 * Si Gemini no está configurado (sin GEMINI_API_KEY), el backend
 * usa un parser local rule-based como fallback.
 */
export function useAiSearch(): UseAiSearchResult {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<AiSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async () => {
    const q = query.trim()
    if (!q) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const data = await aiSearch(q, controller.signal)
      setResult(data)
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError' && err.name !== 'CanceledError') {
        setError('Error al buscar. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }, [query])

  return { query, setQuery, search, result, loading, error }
}
