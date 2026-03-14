import dotenv from 'dotenv'
import { env } from './env.validation'

// Cargar variables de entorno desde .env
dotenv.config()

/**
 * Configuración centralizada de la aplicación
 * Todas las variables están validadas mediante env.validation.ts
 */
export const config = {
  // Core
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  frontendUrl: env.FRONTEND_URL,

  // Database
  databaseUrl: env.DATABASE_URL,

  // Authentication
  jwtSecret: env.JWT_SECRET,

  // Google OAuth
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI,
    loginRedirectUri: env.GOOGLE_LOGIN_REDIRECT_URI,
  },

  // Stripe
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    priceId: env.STRIPE_PRICE_ID,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },

  // Cloudinary
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  // Email
  email: {
    resendApiKey: env.RESEND_API_KEY,
    from: env.EMAIL_FROM,
  },

  // Push Notifications
  vapid: {
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
    subject: env.VAPID_SUBJECT,
  },
}
