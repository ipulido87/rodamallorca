/**
 * Script para verificar y actualizar el estado de Stripe Connect de un taller
 *
 * Uso:
 * pnpm tsx src/scripts/fix-stripe-onboarding.ts <workshopId>
 */

import prisma from '../lib/prisma'
import { stripe } from '../modules/subscriptions/infrastructure/stripe.config'

async function fixStripeOnboarding(workshopId: string) {
  console.log(`\n🔧 [Fix Stripe] Verificando workshop: ${workshopId}`)
  console.log('='.repeat(60))

  // Buscar el workshop
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
    console.error(`❌ Workshop no encontrado: ${workshopId}`)
    process.exit(1)
  }

  console.log(`\n📋 Estado actual:`)
  console.log(`   Nombre: ${workshop.name}`)
  console.log(`   Stripe Account ID: ${workshop.stripeConnectedAccountId || '❌ NO CONFIGURADO'}`)
  console.log(`   Onboarding Complete: ${workshop.stripeOnboardingComplete ? '✅ SÍ' : '❌ NO'}`)

  if (!workshop.stripeConnectedAccountId) {
    console.error(`\n❌ El taller no tiene cuenta de Stripe Connect configurada.`)
    console.log(`\n💡 Solución: El propietario debe:`)
    console.log(`   1. Ir a la página de configuración de pagos`)
    console.log(`   2. Conectar su cuenta de Stripe`)
    process.exit(1)
  }

  // Verificar la cuenta en Stripe
  console.log(`\n🔍 Verificando cuenta en Stripe...`)

  try {
    const account = await stripe.accounts.retrieve(workshop.stripeConnectedAccountId)

    console.log(`\n✅ Cuenta encontrada en Stripe:`)
    console.log(`   Account ID: ${account.id}`)
    console.log(`   Details Submitted: ${account.details_submitted ? '✅' : '❌'}`)
    console.log(`   Charges Enabled: ${account.charges_enabled ? '✅' : '❌'}`)
    console.log(`   Payouts Enabled: ${account.payouts_enabled ? '✅' : '❌'}`)

    const onboardingComplete = account.details_submitted && account.charges_enabled && account.payouts_enabled

    console.log(`\n📊 Resultado: Onboarding ${onboardingComplete ? '✅ COMPLETO' : '❌ INCOMPLETO'}`)

    // Actualizar en la base de datos
    if (onboardingComplete !== workshop.stripeOnboardingComplete) {
      console.log(`\n💾 Actualizando base de datos...`)

      const updated = await prisma.workshop.update({
        where: { id: workshopId },
        data: { stripeOnboardingComplete: onboardingComplete },
      })

      console.log(`✅ Base de datos actualizada:`)
      console.log(`   stripeOnboardingComplete: ${workshop.stripeOnboardingComplete} → ${updated.stripeOnboardingComplete}`)
    } else {
      console.log(`\nℹ️  No se requiere actualización (estado correcto en BD)`)
    }

    // Si no está completo, mostrar qué falta
    if (!onboardingComplete) {
      console.log(`\n⚠️  El onboarding NO está completo. Razones:`)
      if (!account.details_submitted) {
        console.log(`   ❌ details_submitted = false (faltan detalles de la cuenta)`)
      }
      if (!account.charges_enabled) {
        console.log(`   ❌ charges_enabled = false (no puede recibir pagos)`)
      }
      if (!account.payouts_enabled) {
        console.log(`   ❌ payouts_enabled = false (no puede recibir transferencias)`)
      }

      console.log(`\n💡 Solución:`)
      console.log(`   El propietario debe completar la configuración de Stripe:`)
      console.log(`   1. Ir a: https://rodamallorca.es/stripe-connect/refresh`)
      console.log(`   2. Seguir el enlace de Stripe para completar la información`)
      console.log(`   3. Proporcionar todos los datos requeridos (identidad, banco, etc.)`)
    } else {
      console.log(`\n🎉 ¡Todo correcto! El taller puede recibir pagos.`)
    }

  } catch (error: any) {
    console.error(`\n❌ Error al verificar cuenta en Stripe:`, error.message)

    if (error.code === 'resource_missing') {
      console.log(`\n⚠️  La cuenta de Stripe ya no existe.`)
      console.log(`💡 Solución: Limpiar la cuenta de la BD y reconectar.`)

      console.log(`\n💾 Limpiando cuenta inválida de la BD...`)
      await prisma.workshop.update({
        where: { id: workshopId },
        data: {
          stripeConnectedAccountId: null,
          stripeOnboardingComplete: false,
        },
      })
      console.log(`✅ Cuenta limpiada. El propietario debe reconectar Stripe.`)
    }

    process.exit(1)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`✅ Verificación completada\n`)
}

// Ejecutar el script
const workshopId = process.argv[2]

if (!workshopId) {
  console.error(`\n❌ Error: Debes proporcionar un workshopId`)
  console.log(`\nUso: pnpm tsx src/scripts/fix-stripe-onboarding.ts <workshopId>\n`)
  process.exit(1)
}

fixStripeOnboarding(workshopId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n❌ Error fatal:`, error)
    process.exit(1)
  })
