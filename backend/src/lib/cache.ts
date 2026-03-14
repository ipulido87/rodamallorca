import NodeCache from 'node-cache'
import type { Request, Response, NextFunction } from 'express'

// Cache instance with default TTL of 60 seconds and check period of 120 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 })

/**
 * Express middleware that caches GET responses by URL + query string.
 * @param ttlSeconds - Time to live in seconds (default: 60)
 */
export function cacheMiddleware(ttlSeconds = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    const key = `__cache__${req.originalUrl}`
    const cached = cache.get<{ body: unknown; statusCode: number }>(key)

    // Set HTTP cache headers so browsers/CDNs also cache
    res.set('Cache-Control', `public, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}`)

    if (cached) {
      res.set('X-Cache', 'HIT')
      return res.status(cached.statusCode).json(cached.body)
    }

    // Override res.json to intercept the response and cache it
    const originalJson = res.json.bind(res)
    res.json = (body: unknown) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, { body, statusCode: res.statusCode }, ttlSeconds)
      }
      res.set('X-Cache', 'MISS')
      return originalJson(body)
    }

    next()
  }
}

/**
 * Invalidate cache entries that match a prefix.
 * Useful for busting cache after writes (POST/PUT/DELETE).
 * @param prefix - URL prefix to match (e.g., '/api/catalog')
 */
export function invalidateCache(prefix: string) {
  const keys = cache.keys()
  const toDelete = keys.filter((k) => k.startsWith(`__cache__${prefix}`))
  cache.del(toDelete)
}

/**
 * Get cache stats for monitoring.
 */
export function getCacheStats() {
  return cache.getStats()
}

export { cache }
