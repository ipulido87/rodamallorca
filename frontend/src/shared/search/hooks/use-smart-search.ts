import Fuse, { type IFuseOptions } from 'fuse.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
 * IMPORTANTE: La instancia de Fuse se guarda en un ref para evitar que una
 * referencia nueva de 'options' (objeto literal en el componente) destruya y
 * recree el índice en cada render antes de que pueda ser usado.
 */
export function useSmartSearch<T>(
  items: T[],
  options: SmartSearchOptions<T>,
  debounceMs = 300
): UseSmartSearchResult<T> {
  const [rawQuery, setRawQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref estable para la instancia de Fuse — nunca se recrea por cambios de options
  const fuseRef = useRef<Fuse<T> | null>(null)
  // Guardamos las options en un ref para poder leerlas en el effect sin recrear Fuse
  const optionsRef = useRef(options)
  optionsRef.current = options

  // Re-indexar solo cuando cambian los items
  useEffect(() => {
    if (items.length === 0) {
      fuseRef.current = null
      return
    }
    const fuseOptions: IFuseOptions<T> = {
      keys: optionsRef.current.keys as IFuseOptions<T>['keys'],
      threshold: optionsRef.current.threshold ?? 0.2,
      includeScore: true,
      minMatchCharLength: 3,
      shouldSort: true,
      ignoreLocation: true,
      findAllMatches: false,
    }
    fuseRef.current = new Fuse(items, fuseOptions)
  }, [items])

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

    // Si hay término semántico real tras el parsing NLP, buscar con Fuse
    if (parsedQuery.q.trim() && fuseRef.current) {
      return fuseRef.current.search(parsedQuery.q).map((r) => r.item)
    }

    // Solo filtros NLP (ciudad, condición, precio) sin término textual → devolver todos
    return items
  }, [debouncedQuery, parsedQuery.q, items])

  return {
    results,
    rawQuery,
    parsedQuery,
    isFiltered: debouncedQuery.trim().length > 0,
    setQuery,
  }
}
