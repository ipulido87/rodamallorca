import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import path from 'path'

import authRoutes from './modules/auth/interfaces/http/auth.routes'
import catalogRoutes from './modules/catalog/interfaces/http/catalog.routes'
import mediaRoutes from './modules/media/interfaces/http/media.routes' // ← AGREGAR
import orderRoutes from './modules/orders/interfaces/http/order.routes'
import productRoutes from './modules/products/interfaces/http/products.routes'
import workshopRoutes from './modules/workshops/interfaces/http/workshop.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/api/health', (_req, res) => res.send('ok'))

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
