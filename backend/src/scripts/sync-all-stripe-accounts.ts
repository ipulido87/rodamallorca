/**
 * Script para sincronizar TODOS los talleres con el estado real de Stripe
 *
 * Uso:
 * cd backend
 * pnpm tsx src/scripts/sync-all-stripe-accounts.ts
 */

import prisma from '../lib/prisma'
import { stripe } from '../modules/subscriptions/infrastructure/stripe.config'

async function syncAllStripeAccounts() {
  console.log('\n🔄 [Sync] Sincronizando TODOS los talleres con Stripe...')
  console.log('='.repeat(70))

  const workshops = await prisma.workshop.findMany({
    where: {
      stripeConnectedAccountId: { not: null },
    },
    select: {
      id: true,
      name: true,
      stripeConnectedAccountId: true,
      stripeOnboardingComplete: true,
    },
  })

  console.log(`\n📋 Encontrados ${workshops.length} talleres con cuenta de Stripe\n`)

  for (const workshop of workshops) {
    console.log(`\n${'─'.repeat(70)}`)
    console.log(`🏪 ${workshop.name}`)
    console.log(`   ID: ${workshop.id}`)
    console.log(`   Stripe Account: ${workshop.stripeConnectedAccountId}`)
    console.log(`   Onboarding Complete (BD): ${workshop.stripeOnboardingComplete ? '✅' : '❌'}`)

    try {
      const account = await stripe.accounts.retrieve(workshop.stripeConnectedAccountId!)

      const onboardingComplete =
        account.details_submitted &&
        account.charges_enabled &&
        account.payouts_enabled

      console.log(`   Onboarding Complete (Stripe): ${onboardingComplete ? '✅' : '❌'}`)
      console.log(`   └─ Details Submitted: ${account.details_submitted ? '✅' : '❌'}`)
      console.log(`   └─ Charges Enabled: ${account.charges_enabled ? '✅' : '❌'}`)
      console.log(`   └─ Payouts Enabled: ${account.payouts_enabled ? '✅' : '❌'}`)

      // Si el estado en BD no coincide con Stripe, actualizar
      if (onboardingComplete !== workshop.stripeOnboardingComplete) {
        console.log(`\n   ⚠️  Estado desincronizado, actualizando...`)

        await prisma.workshop.update({
          where: { id: workshop.id },
          data: { stripeOnboardingComplete: onboardingComplete },
        })

        console.log(`   ✅ Actualizado: ${workshop.stripeOnboardingComplete} → ${onboardingComplete}`)
      } else {
        console.log(`   ℹ️  Estado correcto, no requiere actualización`)
      }

      if (onboardingComplete) {
        console.log(`   🎉 Taller listo para recibir pagos!`)
      } else {
        console.log(`   ⚠️  Taller NO puede recibir pagos todavía`)
      }

    } catch (error: any) {
      console.error(`   ❌ Error al verificar cuenta en Stripe:`, error.message)

      if (error.code === 'resource_missing') {
        console.log(`   ⚠️  La cuenta de Stripe ya no existe, limpiando...`)

        await prisma.workshop.update({
          where: { id: workshop.id },
          data: {
            stripeConnectedAccountId: null,
            stripeOnboardingComplete: false,
          },
        })

        console.log(`   ✅ Cuenta limpiada de la BD`)
      }
    }
  }

  console.log(`\n${'='.repeat(70)}`)
  console.log(`✅ Sincronización completada\n`)
}

syncAllStripeAccounts()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n❌ Error fatal:`, error)
    process.exit(1)
  })
