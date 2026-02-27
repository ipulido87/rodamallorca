import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { type Request, type Response, type NextFunction } from 'express'
import morgan from 'morgan'
import path from 'path'
import { ZodError } from 'zod'

// Cargar variables de entorno primero
dotenv.config()

// Validar variables de entorno al inicio (falla rápido si hay problemas)
import { validateEnv } from './config/env.validation'
import { config } from './config/config'

console.log('🔍 Validando variables de entorno...')
validateEnv()
console.log('✅ Variables de entorno validadas correctamente\n')

// Registrar dependencias en el contenedor IoC
import { registerDependencies } from './lib/di/register-dependencies'
registerDependencies()

// Configuración de Swagger
import { setupSwagger } from './config/swagger'

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
import paymentRoutes from './modules/payments/interfaces/http/payment.routes'
import stripeConnectRoutes from './modules/payments/routes/stripe-connect.routes'
import directoryRoutes from './modules/workshops/routes/directory.routes'
import rentalRoutes from './modules/rentals/interfaces/http/rental.routes'
import reviewRoutes from './modules/reviews/interfaces/http/review.routes'
import sitemapRoutes from './routes/sitemap.routes'
import adminNotificationsRoutes from './modules/notifications/interfaces/http/admin-notifications.routes'

const app = express()
const PORT = config.port

// Setup Swagger documentation (solo en desarrollo)
if (config.nodeEnv !== 'production') {
  setupSwagger(app)
  console.log('📚 Swagger disponible en /api/docs')
}

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
        config.frontendUrl,
      ].filter(Boolean)

      // Permitir requests sin origin (ej: Postman, curl) o desde origins permitidos
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        if (config.nodeEnv === 'development') {
          console.warn(`⚠️ CORS: Origen no permitido: ${origin}`)
        }
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
app.use('/api/payments', paymentRoutes) // Rutas de pagos de productos
app.use('/api/workshops', stripeConnectRoutes) // Rutas de Stripe Connect
app.use('/api/directory', directoryRoutes) // Directorio público de talleres
app.use('/api/rentals', rentalRoutes) // Rutas de alquiler de bicicletas
app.use('/api', reviewRoutes) // Rutas de reviews
app.use('/', sitemapRoutes) // Sitemap dinámico
app.use('/api/admin', adminNotificationsRoutes) // Rutas de administración

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/api/health', (_req, res) => res.send('ok'))

app.get('/api/status', async (_req, res) => {
  const startTime = Date.now()
  const status: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
    services: {} as Record<string, string>,
  }

  // Check database connectivity
  try {
    const { default: prisma } = await import('./lib/prisma')
    await prisma.$queryRaw`SELECT 1`
    ;(status.services as Record<string, string>).database = 'connected'
  } catch {
    ;(status.services as Record<string, string>).database = 'disconnected'
    status.status = 'degraded'
  }

  status.responseTime = `${Date.now() - startTime}ms`

  const httpStatus = status.status === 'ok' ? 200 : 503
  res.status(httpStatus).json(status)
})

// Middleware de manejo de errores global (debe ir al final)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Log del error en desarrollo
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', err)
  }

  // Errores de validación de Zod
  if (err?.name === 'ZodError' || err?.issues) {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.issues?.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') || err.message,
      details: err.issues,
    })
  }

  // Errores personalizados de la aplicación (AppError y sus subclases)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      message: err.message,
      code: err.code,
      ...(err.errors && { details: err.errors }),
    })
  }

  // Errores de negocio (mensajes en español) - backward compatibility
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
  console.error('❌ Error no manejado:', err)
  return res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ha ocurrido un error inesperado',
  })
})

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en modo ${config.nodeEnv}`)
  console.log(`📡 Servidor: http://localhost:${PORT}`)
  console.log(`🌐 Frontend: ${config.frontendUrl}`)
})
