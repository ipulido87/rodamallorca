import cookieParser from 'cookie-parser' // 👈
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import morgan from 'morgan'
import authRoutes from './modules/auth/infrastructure/http/auth.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middlewares
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser()) // 👈 necesario para leer/escribir cookies

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // 👈 tu front
    credentials: true, // 👈 permite cookies
  })
)

// Rutas
app.use('/api/auth', authRoutes)

// Healthcheck (opcional)
app.get('/api/health', (_req, res) => res.send('ok'))

// Start
app.listen(PORT, () => {
  console.log(`Auth service running on http://localhost:${PORT}`)
})
