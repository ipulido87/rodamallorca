import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('❌ STRIPE_SECRET_KEY no está configurada en .env')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// ID del precio de la suscripción (debe crearse en Stripe Dashboard)
// Precio: 18.30 EUR/mes (IVA incluido)
export const SUBSCRIPTION_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_xxx'

// Configuración del trial
export const TRIAL_PERIOD_DAYS = 7

console.log('✅ [Stripe] Configurado correctamente')
console.log(`💰 [Stripe] Price ID: ${SUBSCRIPTION_PRICE_ID}`)
console.log(`🎁 [Stripe] Trial period: ${TRIAL_PERIOD_DAYS} días`)
