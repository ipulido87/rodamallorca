const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkWorkshops() {
  try {
    console.log('🔍 Buscando todos los workshops con sus datos de Stripe Connect...\n')

    const workshops = await prisma.workshop.findMany({
      select: {
        id: true,
        name: true,
        stripeConnectedAccountId: true,
        stripeOnboardingComplete: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (workshops.length === 0) {
      console.log('❌ No se encontraron workshops en la base de datos')
      return
    }

    console.log(`📊 Total de workshops: ${workshops.length}\n`)

    workshops.forEach((workshop, index) => {
      console.log(`\n--- Workshop ${index + 1} ---`)
      console.log(`ID: ${workshop.id}`)
      console.log(`Nombre: ${workshop.name}`)
      console.log(`Stripe Account ID: ${workshop.stripeConnectedAccountId || '❌ NO CONFIGURADO'}`)
      console.log(`Onboarding Completo: ${workshop.stripeOnboardingComplete ? '✅ SÍ' : '❌ NO'}`)
      console.log(`Creado: ${workshop.createdAt}`)
    })

    console.log('\n' + '='.repeat(50))
    const withStripe = workshops.filter(w => w.stripeConnectedAccountId)
    const completed = workshops.filter(w => w.stripeOnboardingComplete)
    console.log(`\n📈 Resumen:`)
    console.log(`   - Con cuenta Stripe: ${withStripe.length}/${workshops.length}`)
    console.log(`   - Onboarding completado: ${completed.length}/${workshops.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkWorkshops()
