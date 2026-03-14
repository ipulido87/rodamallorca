import { z } from 'zod'

/**
 * Schema de validación para variables de entorno
 * Este schema garantiza que todas las variables requeridas estén presentes al inicio
 */
const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess(
    (val) => (val ? String(val) : '4000'),
    z.string().regex(/^\d+$/).transform(Number)
  ),
  FRONTEND_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres para ser seguro'),

  // Google OAuth (opcionales - solo si se usa OAuth)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  GOOGLE_LOGIN_REDIRECT_URI: z.string().url().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_PRICE_ID: z.string().min(1, 'STRIPE_PRICE_ID is required for subscriptions'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),

  // Cloudinary (opcionales - pueden usar almacenamiento local)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Email con Resend
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_FROM: z.string().email('EMAIL_FROM debe ser un email válido').or(z.string().regex(/^.+<.+@.+>$/, 'EMAIL_FROM debe tener formato "Name <email@domain.com>"')),

  // Push Notifications (opcionales)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().email().or(z.string().startsWith('mailto:')).optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Valida las variables de entorno al inicio de la aplicación
 * Lanza un error descriptivo si falta alguna variable requerida
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(err => {
        const path = err.path.join('.')
        return `  ❌ ${path}: ${err.message}`
      }).join('\n')

      console.error('\n🚨 Error de configuración: Variables de entorno faltantes o inválidas:\n')
      console.error(missingVars)
      console.error('\n💡 Verifica tu archivo .env y asegúrate de que todas las variables requeridas estén configuradas.\n')

      process.exit(1)
    }
    throw error
  }
}

/**
 * Variables de entorno validadas (se inicializan después de llamar a validateEnv())
 * IMPORTANTE: Este valor solo está disponible después de que la aplicación inicie
 */
let _env: Env | null = null

export function getEnv(): Env {
  if (!_env) {
    _env = validateEnv()
  }
  return _env
}

// Re-exportar para compatibilidad con importaciones existentes
export const env = new Proxy({} as Env, {
  get(_target, prop) {
    return getEnv()[prop as keyof Env]
  }
})
