/**
 * Script para limpiar una cuenta de Stripe Connect inválida
 *
 * Uso:
 * pnpm tsx src/scripts/clean-invalid-stripe-account.ts <accountId>
 *
 * Ejemplo:
 * pnpm tsx src/scripts/clean-invalid-stripe-account.ts acct_1SlQ0r2KAVlwZfx2
 */

import prisma from '../lib/prisma'

async function cleanInvalidAccount(accountId: string) {
  console.log(`\n🧹 [Clean] Limpiando cuenta de Stripe inválida: ${accountId}`)
  console.log('='.repeat(70))

  // Buscar todos los talleres con esta cuenta
  const workshops = await prisma.workshop.findMany({
    where: {
      stripeConnectedAccountId: accountId,
    },
    select: {
      id: true,
      name: true,
      stripeConnectedAccountId: true,
      stripeOnboardingComplete: true,
    },
  })

  if (workshops.length === 0) {
    console.log(`\n❌ No se encontraron talleres con la cuenta: ${accountId}`)
    process.exit(1)
  }

  console.log(`\n📋 Encontrados ${workshops.length} taller(es) con esta cuenta:\n`)

  for (const workshop of workshops) {
    console.log(`   🏪 ${workshop.name}`)
    console.log(`      ID: ${workshop.id}`)
    console.log(`      Cuenta Stripe: ${workshop.stripeConnectedAccountId}`)
    console.log(`      Onboarding: ${workshop.stripeOnboardingComplete ? '✅' : '❌'}`)
    console.log()
  }

  console.log(`⚠️  Esta acción va a:`)
  console.log(`   1. Eliminar la cuenta de Stripe Connect inválida`)
  console.log(`   2. Marcar stripeOnboardingComplete = false`)
  console.log(`   3. El propietario deberá reconectar Stripe desde cero\n`)

  // Limpiar la cuenta de todos los talleres
  const result = await prisma.workshop.updateMany({
    where: {
      stripeConnectedAccountId: accountId,
    },
    data: {
      stripeConnectedAccountId: null,
      stripeOnboardingComplete: false,
    },
  })

  console.log(`✅ Limpiados ${result.count} taller(es)`)
  console.log(`\n💡 Próximos pasos:`)
  console.log(`   1. El propietario debe ir a su panel de control`)
  console.log(`   2. Ir a Configuración de Pagos`)
  console.log(`   3. Hacer clic en "Conectar con Stripe"`)
  console.log(`   4. Completar el proceso de verificación`)
  console.log(`\n${'='.repeat(70)}`)
  console.log(`✅ Cuenta limpiada correctamente\n`)
}

// Ejecutar el script
const accountId = process.argv[2]

if (!accountId) {
  console.error(`\n❌ Error: Debes proporcionar un accountId`)
  console.log(`\nUso: pnpm tsx src/scripts/clean-invalid-stripe-account.ts <accountId>`)
  console.log(`\nEjemplo: pnpm tsx src/scripts/clean-invalid-stripe-account.ts acct_1SlQ0r2KAVlwZfx2\n`)
  process.exit(1)
}

cleanInvalidAccount(accountId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`\n❌ Error fatal:`, error)
    process.exit(1)
  })
