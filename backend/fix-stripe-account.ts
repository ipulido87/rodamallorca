import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixStripeAccount() {
  const workshopId = '9d074790-7f9a-4869-99f0-5f17af445af1'
  
  console.log(`🔧 Limpiando cuenta de Stripe Connect del taller ${workshopId}...`)
  
  const workshop = await prisma.workshop.findUnique({
    where: { id: workshopId },
  })
  
  if (!workshop) {
    console.error('❌ Taller no encontrado')
    return
  }
  
  console.log('📋 Taller actual:')
  console.log('  - Nombre:', workshop.name)
  console.log('  - Stripe Account ID viejo:', workshop.stripeConnectedAccountId)
  console.log('  - Onboarding Complete:', workshop.stripeOnboardingComplete)
  
  // Limpiar campos de Stripe Connect
  await prisma.workshop.update({
    where: { id: workshopId },
    data: {
      stripeConnectedAccountId: null,
      stripeOnboardingComplete: false,
    },
  })
  
  console.log('✅ Cuenta de Stripe limpiada. Ahora puedes reconectar Stripe Connect.')
  
  await prisma.$disconnect()
}

fixStripeAccount().catch(console.error)
