import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { type Request, type Response, type NextFunction } from 'express'
import morgan from 'morgan'
import path from 'path'
import { ZodError } from 'zod'

import authRoutes from './modules/auth/interfaces/http/auth.routes'
import catalogRoutes from './modules/catalog/interfaces/http/catalog.routes'
import mediaRoutes from './modules/media/interfaces/http/media.routes'
import orderRoutes from './modules/orders/interfaces/http/order.routes'
import productRoutes from './modules/products/interfaces/http/products.routes'
import workshopRoutes from './modules/workshops/interfaces/http/workshop.routes'
import serviceRoutes from './modules/services/interfaces/http/service.routes'
import billingRoutes from './modules/billing/interfaces/http/billing.routes'
import favoriteRoutes from './modules/favorites/interfaces/http/favorite.routes'
import customerRoutes from './modules/customers/interfaces/http/customer.routes'
import subscriptionRoutes from './modules/subscriptions/interfaces/http/subscription.routes'
import webhookRoutes from './modules/subscriptions/interfaces/http/webhook.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(morgan('dev'))

// IMPORTANTE: Webhook de Stripe debe ir ANTES de express.json()
// porque necesita raw body
app.use('/api/webhooks', webhookRoutes)

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://rodamallorca.vercel.app',
        'https://frontend-production-2ce0.up.railway.app',
        'https://www.rodamallorca.es',
        'https://rodamallorca.es',
        process.env.FRONTEND_URL
      ].filter(Boolean)

      console.log('🔍 [CORS DEBUG] Origin recibido:', origin)
      console.log('🔍 [CORS DEBUG] Allowed origins:', allowedOrigins)
      console.log('🔍 [CORS DEBUG] FRONTEND_URL env:', process.env.FRONTEND_URL)

      if (!origin || allowedOrigins.includes(origin)) {
        console.log('✅ [CORS DEBUG] Origen permitido')
        callback(null, true)
      } else {
        console.log('❌ [CORS DEBUG] Origen RECHAZADO')
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
  })
)

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/catalog', catalogRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/owner', productRoutes)
app.use('/api/owner', workshopRoutes)
app.use('/api', serviceRoutes) // Rutas de servicios (públicas y protegidas)
app.use('/api', billingRoutes) // Rutas de facturación
app.use('/api/favorites', favoriteRoutes) // Rutas de favoritos
app.use('/api/customers', customerRoutes) // Rutas de clientes
app.use('/api/subscriptions', subscriptionRoutes) // Rutas de suscripciones

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/api/health', (_req, res) => res.send('ok'))

// Middleware de manejo de errores global (debe ir al final)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err)

  // Errores de validación de Zod
  if (err?.name === 'ZodError' || err?.issues) {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.issues?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') || err.message,
      details: err.issues,
    })
  }

  // Errores de negocio (mensajes en español)
  if (err?.message) {
    // Determinar el código de estado basado en el mensaje
    let statusCode = 500

    if (
      err.message.includes('no encontrado') ||
      err.message.includes('not found')
    ) {
      statusCode = 404
    } else if (
      err.message.includes('no tienes permisos') ||
      err.message.includes('no autenticado') ||
      err.message.includes('no autorizado')
    ) {
      statusCode = 403
    } else if (
      err.message.includes('no se puede') ||
      err.message.includes('ya está') ||
      err.message.includes('completado') ||
      err.message.includes('cancelado')
    ) {
      statusCode = 400
    }

    return res.status(statusCode).json({
      error: err.message,
      message: err.message,
    })
  }

  // Error genérico
  return res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ha ocurrido un error inesperado',
  })
})

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
