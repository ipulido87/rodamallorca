export interface SearchProvider<T> {
  index(items: T[]): void
  search(query: string): T[]
}

export interface ParsedQuery {
  q: string
  city?: string
  condition?: 'new' | 'used' | 'refurb'
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'newest'
  maxPrice?: number
  minPrice?: number
}

export interface SmartSearchOptions<T> {
  keys: Array<{ name: keyof T & string; weight: number }>
  threshold?: number
}
