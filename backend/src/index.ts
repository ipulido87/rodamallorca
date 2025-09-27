import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'

import authRoutes from './modules/auth/interfaces/http/auth.routes'
import catalogRoutes from './modules/catalog/interfaces/http/catalog.routes'
import productRoutes from './modules/products/interfaces/http/products.routes'
import {
  default as ownerRoutes,
  default as workshopRoutes,
} from './modules/workshops/interfaces/http/workshop.routes'
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

// Montaje de rutas
app.use('/api/auth', authRoutes)
app.use('/api/catalog', catalogRoutes) // público
app.use('/api/owner', ownerRoutes) // privado (JWT + role)

app.get('/api/health', (_req, res) => res.send('ok'))

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})
app.use('/api/owner', productRoutes)
app.use('/api/owner', workshopRoutes)

app.use('/api/owner', ownerRoutes) 