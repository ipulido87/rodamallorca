import Fuse, { type IFuseOptions } from 'fuse.js'
import type { SearchProvider, SmartSearchOptions } from '../types'

/**
 * Proveedor de búsqueda fuzzy basado en Fuse.js.
 * Agnóstico al tipo de datos — funciona para workshops, productos, servicios, etc.
 *
 * Aguanta typos, búsquedas parciales y da resultados relevantes por peso de campo.
 */
export class FuseSearchProvider<T> implements SearchProvider<T> {
  private fuse: Fuse<T> | null = null
  private readonly options: IFuseOptions<T>

  constructor(searchOptions: SmartSearchOptions<T>) {
    this.options = {
      keys: searchOptions.keys as IFuseOptions<T>['keys'],
      threshold: searchOptions.threshold ?? 0.35,
      includeScore: true,
      minMatchCharLength: 2,
      shouldSort: true,
      ignoreLocation: true,
      findAllMatches: true,
    }
  }

  index(items: T[]): void {
    this.fuse = new Fuse(items, this.options)
  }

  search(query: string): T[] {
    if (!this.fuse) return []
    if (!query.trim()) return []

    return this.fuse.search(query).map((result) => result.item)
  }
}
