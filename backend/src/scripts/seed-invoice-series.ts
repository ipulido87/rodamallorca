import prisma from '../lib/prisma'

async function seedInvoiceSeries() {
  console.log('🌱 Seeding invoice series...')

  try {
    // Obtener todos los talleres
    const workshops = await prisma.workshop.findMany()

    for (const workshop of workshops) {
      // Verificar si ya tiene series
      const existingSeries = await prisma.invoiceSeries.findFirst({
        where: { workshopId: workshop.id },
      })

      if (!existingSeries) {
        // Crear serie por defecto para el año actual
        const currentYear = new Date().getFullYear()

        await prisma.invoiceSeries.create({
          data: {
            workshopId: workshop.id,
            name: 'Serie Principal',
            prefix: 'F',
            nextNumber: 1,
            year: currentYear,
            isDefault: true,
          },
        })

        console.log(`✅ Serie creada para taller: ${workshop.name}`)
      } else {
        console.log(`ℹ️  Taller ${workshop.name} ya tiene series`)
      }
    }

    console.log('✅ Seed completado')
  } catch (error) {
    console.error('❌ Error en seed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedInvoiceSeries()
