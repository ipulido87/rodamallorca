/**
 * Script para buscar y reconectar cuenta de Stripe por email
 *
 * Uso:
 * pnpm tsx src/scripts/reconnect-stripe-by-email.ts <email>
 *
 * Ejemplo:
 * pnpm tsx src/scripts/reconnect-stripe-by-email.ts ordenadoctorpaima@gmail.com
 */

import prisma from '../lib/prisma'
import { stripe } from '../modules/subscriptions/infrastructure/stripe.config'

async function reconnectStripeByEmail(email: string) {
  console.log(`\n🔍 [Reconnect] Buscando cuenta de Stripe para: ${email}`)
  console.log('='.repeat(70))

  // Buscar talleres del usuario con este email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  if (!user) {
    console.error(`\n❌ Usuario no encontrado con email: ${email}`)
    process.exit(1)
  }

  console.log(`\n✅ Usuario encontrado:`)
  console.log(`   Nombre: ${user.name}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   ID: ${user.id}`)

  // Buscar taller del usuario
  const workshop = await prisma.workshop.findFirst({
    where: { ownerId: user.id },
    select: {
      id: true,
      name: true,
      stripeConnectedAccountId: true,
      stripeOnboardingComplete: true,
    },
  })

  if (!workshop) {
    console.error(`\n❌ No se encontró taller para este usuario`)
    process.exit(1)
  }

  console.log(`\n✅ Taller encontrado:`)
  console.log(`   Nombre: ${workshop.name}`)
  console.log(`   ID: ${workshop.id}`)
  console.log(`   Cuenta Stripe actual: ${workshop.stripeConnectedAccountId || '❌ SIN CUENTA'}`)

  // Buscar cuentas de Stripe con este email
  console.log(`\n🔍 Buscando cuentas de Stripe en Stripe.com...`)

  try {
    const accounts = await stripe.accounts.list({
      limit: 100,
    })

    // Filtrar por email
    const matchingAccounts = accounts.data.filter(
      (account) => account.email?.toLowerCase() === email.toLowerCase()
    )

    console.log(`\n📋 Cuentas encontradas: ${matchingAccounts.length}`)

    if (matchingAccounts.length === 0) {
      console.error(`\n❌ No se encontraron cuentas de Stripe con el email: ${email}`)
      console.log(`\n💡 Solución: El propietario debe conectar Stripe desde su panel de control`)
      process.exit(1)
    }

    // Mostrar todas las cuentas encontradas
    matchingAccounts.forEach((account, index) => {
      console.log(`\n   ${index + 1}. Account ID: ${account.id}`)
      console.log(`      Email: ${account.email}`)
      console.log(`      Country: ${account.country}`)
      console.log(`      Details Submitted: ${account.details_submitted ? '✅' : '❌'}`)
      console.log(`      Charges Enabled: ${account.charges_enabled ? '✅' : '❌'}`)
      console.log(`      Payouts Enabled: ${account.payouts_enabled ? '✅' : '❌'}`)
    })

    // Usar la primera cuenta activa
    const activeAccount = matchingAccounts.find(
      (account) => account.details_submitted && account.charges_enabled && account.payouts_enabled
    )

    if (!activeAccount) {
      console.log(`\n⚠️  Se encontraron cuentas pero ninguna está completamente activa`)
      console.log(`💡 Solución: El propietario debe completar la verificación en Stripe`)
      process.exit(1)
    }

    console.log(`\n✅ Cuenta activa seleccionada: ${activeAccount.id}`)

    const onboardingComplete =
      activeAccount.details_submitted &&
      activeAccount.charges_enabled &&
      activeAccount.payouts_enabled

    // Actualizar en la base de datos
    console.log(`\n💾 Actualizando taller en la base de datos...`)

    const updated = await prisma.workshop.update({
      where: { id: workshop.id },
      data: {
        stripeConnectedAccountId: activeAccount.id,
        stripeOnboardingComplete: onboardingComplete,
      },
    })

    console.log(`\n✅ Taller actualizado correctamente:`)
    console.log(`   Nombre: ${updated.name}`)
    console.log(`   Cuenta Stripe: ${updated.stripeConnectedAccountId}`)
    console.log(`   Onboarding Completo: ${updated.stripeOnboardingComplete ? '✅' : '❌'}`)

    if (onboardingComplete) {
      console.log(`\n🎉 ¡Perfecto! El taller ya puede recibir pagos de productos.`)
      console.log(`\n💡 Prueba comprando un producto ahora para verificar que funciona.`)
    }
  } catch (error: any) {
    console.error(`\n❌ Error buscando cuentas en Stripe:`, error.message)
    process.exit(1)
  }

  console.log(`\n${'='.repeat(70)}`)
  console.log(`✅ Reconexión completada\n`)
}

// Ejecutar el script
const email = process.argv[2]

if (!email) {
  console.error(`\n❌ Error: Debes proporcionar un email`)
  console.log(`\nUso: pnpm tsx src/scripts/reconnect-stripe-by-email.ts <email>`)
  console.log(`\nEjemplo: pnpm tsx src/scripts/reconnect-stripe-by-email.ts usuario@example.com\n`)
  process.exit(1)
}

reconnectStripeByEmail(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n❌ Error fatal:`, error)
    process.exit(1)
  })
