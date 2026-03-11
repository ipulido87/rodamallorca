import rateLimit from 'express-rate-limit'

/**
 * General API rate limiter: 100 requests per minute per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: 'Demasiadas solicitudes',
    message: 'Has excedido el límite de solicitudes. Intenta de nuevo en un minuto.',
  },
})

/**
 * Stricter limiter for auth endpoints: 15 requests per minute per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos de autenticación',
    message: 'Has excedido el límite de intentos. Intenta de nuevo en un minuto.',
  },
})

/**
 * AI search limiter: 10 requests per minute per IP (expensive operation).
 */
export const aiSearchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiadas búsquedas IA',
    message: 'Has excedido el límite de búsquedas con IA. Intenta de nuevo en un minuto.',
  },
})
