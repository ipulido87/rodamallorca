/**
 * Script para actualizar manualmente la cuenta de Stripe Connect de un taller
 *
 * Uso:
 * pnpm tsx src/scripts/update-stripe-account.ts <workshopId> <newAccountId>
 *
 * Ejemplo:
 * pnpm tsx src/scripts/update-stripe-account.ts <workshop-id> acct_1St4kKtWwiCP4k2
 */

import prisma from '../lib/prisma'
import { stripe } from '../modules/subscriptions/infrastructure/stripe.config'

async function updateStripeAccount(workshopId: string, newAccountId: string) {
  console.log(`\n🔄 [Update] Actualizando cuenta de Stripe del taller`)
  console.log('='.repeat(70))

  // Buscar el taller
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
    select: {
      id: true,
      name: true,
      stripeConnectedAccountId: true,
      stripeOnboardingComplete: true,
    },
  })

  if (!workshop) {
    console.error(`\n❌ Workshop no encontrado: ${workshopId}`)
    process.exit(1)
  }

  console.log(`\n📋 Taller actual:`)
  console.log(`   Nombre: ${workshop.name}`)
  console.log(`   ID: ${workshop.id}`)
  console.log(`   Cuenta Stripe actual: ${workshop.stripeConnectedAccountId || '❌ SIN CUENTA'}`)
  console.log(`   Onboarding completo: ${workshop.stripeOnboardingComplete ? '✅' : '❌'}`)

  // Verificar que la nueva cuenta existe en Stripe
  console.log(`\n🔍 Verificando nueva cuenta en Stripe: ${newAccountId}`)

  try {
    const account = await stripe.accounts.retrieve(newAccountId)

    console.log(`\n✅ Cuenta encontrada en Stripe:`)
    console.log(`   Account ID: ${account.id}`)
    console.log(`   Email: ${account.email || 'N/A'}`)
    console.log(`   Country: ${account.country}`)
    console.log(`   Details Submitted: ${account.details_submitted ? '✅' : '❌'}`)
    console.log(`   Charges Enabled: ${account.charges_enabled ? '✅' : '❌'}`)
    console.log(`   Payouts Enabled: ${account.payouts_enabled ? '✅' : '❌'}`)

    const onboardingComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled

    console.log(`\n📊 Resultado: Onboarding ${onboardingComplete ? '✅ COMPLETO' : '❌ INCOMPLETO'}`)

    // Actualizar en la base de datos
    console.log(`\n💾 Actualizando base de datos...`)

    const updated = await prisma.workshop.update({
      where: { id: workshopId },
      data: {
        stripeConnectedAccountId: newAccountId,
        stripeOnboardingComplete: onboardingComplete,
      },
    })

    console.log(`\n✅ Taller actualizado correctamente:`)
    console.log(`   Cuenta Stripe: ${workshop.stripeConnectedAccountId || 'null'} → ${updated.stripeConnectedAccountId}`)
    console.log(`   Onboarding: ${workshop.stripeOnboardingComplete} → ${updated.stripeOnboardingComplete}`)

    if (onboardingComplete) {
      console.log(`\n🎉 ¡Perfecto! El taller ya puede recibir pagos de productos.`)
    } else {
      console.log(`\n⚠️  El onboarding no está completo todavía.`)
      console.log(`   El propietario debe completar la configuración en Stripe.`)
    }

  } catch (error: any) {
    console.error(`\n❌ Error al verificar cuenta en Stripe:`, error.message)

    if (error.code === 'resource_missing') {
      console.log(`\n⚠️  La cuenta ${newAccountId} no existe en Stripe.`)
      console.log(`   Verifica que el Account ID sea correcto.`)
    }

    process.exit(1)
  }

  console.log(`\n${'='.repeat(70)}`)
  console.log(`✅ Actualización completada\n`)
}

// Ejecutar el script
const workshopId = process.argv[2]
const newAccountId = process.argv[3]

if (!workshopId || !newAccountId) {
  console.error(`\n❌ Error: Debes proporcionar workshopId y newAccountId`)
  console.log(`\nUso: pnpm tsx src/scripts/update-stripe-account.ts <workshopId> <newAccountId>`)
  console.log(`\nEjemplo: pnpm tsx src/scripts/update-stripe-account.ts abc123 acct_1St4kKtWwiCP4k2\n`)
  process.exit(1)
}

updateStripeAccount(workshopId, newAccountId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n❌ Error fatal:`, error)
    process.exit(1)
  })
