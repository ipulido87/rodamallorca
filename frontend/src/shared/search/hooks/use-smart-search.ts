import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FuseSearchProvider } from '../providers/fuse-provider'
import { parseQuery } from '../utils/query-parser'
import type { ParsedQuery, SmartSearchOptions } from '../types'

interface UseSmartSearchResult<T> {
  results: T[]
  rawQuery: string
  parsedQuery: ParsedQuery
  isFiltered: boolean
  setQuery: (query: string) => void
}

/**
 * Hook de búsqueda inteligente con NLP básico en español + fuzzy search.
 *
 * - Parsea lenguaje natural: "freno usado barato Palma" → filtros estructurados
 * - Fuzzy search sobre los items ya cargados (aguanta typos)
 * - Genérico: funciona para cualquier tipo T
 *
 * @param items      - Array de items sobre los que buscar
 * @param options    - Configuración de Fuse.js (keys y pesos)
 * @param debounceMs - Debounce en ms (por defecto 300ms)
 */
export function useSmartSearch<T>(
  items: T[],
  options: SmartSearchOptions<T>,
  debounceMs = 300
): UseSmartSearchResult<T> {
  const [rawQuery, setRawQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const provider = useMemo(() => new FuseSearchProvider<T>(options), [options])

  // Re-indexar cuando cambian los items
  useEffect(() => {
    if (items.length > 0) {
      provider.index(items)
    }
  }, [items, provider])

  // Debounce del query
  const setQuery = useCallback(
    (query: string) => {
      setRawQuery(query)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        setDebouncedQuery(query)
      }, debounceMs)
    },
    [debounceMs]
  )

  const parsedQuery = useMemo(() => parseQuery(debouncedQuery), [debouncedQuery])

  const results = useMemo((): T[] => {
    if (!debouncedQuery.trim()) return items

    // Si hay término de búsqueda semántico, usar fuzzy
    if (parsedQuery.q.trim()) {
      return provider.search(parsedQuery.q)
    }

    // Si solo hay filtros (ciudad, condición, etc.) sin término textual, devolver todos
    return items
  }, [debouncedQuery, parsedQuery.q, items, provider])

  return {
    results,
    rawQuery,
    parsedQuery,
    isFiltered: debouncedQuery.trim().length > 0,
    setQuery,
  }
}
