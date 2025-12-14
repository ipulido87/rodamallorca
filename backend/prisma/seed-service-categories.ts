import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const serviceCategories = [
  {
    name: 'Ruedas y neumáticos',
    description:
      'Cambio de cubiertas y cámaras, centrado de ruedas, sustitución de radios',
    icon: 'DirectionsBike',
    position: 1,
  },
  {
    name: 'Transmisión',
    description:
      'Ajuste y cambio de cadena, reparación o sustitución de platos, piñones y bielas, ajuste de cambios',
    icon: 'Settings',
    position: 2,
  },
  {
    name: 'Frenos',
    description:
      'Ajuste de frenos de disco o zapata, sustitución de pastillas o zapatas, purga de frenos hidráulicos',
    icon: 'PanTool',
    position: 3,
  },
  {
    name: 'Suspensión y cuadro',
    description:
      'Mantenimiento de horquillas y amortiguadores, revisión de dirección y potencia',
    icon: 'Build',
    position: 4,
  },
  {
    name: 'Posición y ergonomía',
    description:
      'Ajuste de sillín y manillar, instalación de puños, cintas o potencia regulable',
    icon: 'Accessible',
    position: 5,
  },
  {
    name: 'Montaje y accesorios',
    description:
      'Instalación de portabultos, luces, guardabarros, montaje de bicicletas nuevas o personalizadas',
    icon: 'Construction',
    position: 6,
  },
  {
    name: 'Bicicletas eléctricas (e-bikes)',
    description:
      'Diagnóstico de batería y motor, sustitución de componentes eléctricos, actualización de software',
    icon: 'ElectricBike',
    position: 7,
  },
  {
    name: 'Patinetes eléctricos',
    description:
      'Reparación y mantenimiento de patinetes eléctricos, diagnóstico de batería y motor, cambio de neumáticos',
    icon: 'ElectricScooter',
    position: 8,
  },
  {
    name: 'Mantenimiento general',
    description:
      'Revisión completa, limpieza y engrase, diagnóstico gratuito, packs de mantenimiento',
    icon: 'CleaningServices',
    position: 9,
  },
]

async function main() {
  console.log('🌱 Iniciando seed de categorías de servicios...')

  for (const category of serviceCategories) {
    const existing = await prisma.serviceCategory.findUnique({
      where: { name: category.name },
    })

    if (existing) {
      console.log(`⏭️  Categoría "${category.name}" ya existe, omitiendo...`)
      continue
    }

    await prisma.serviceCategory.create({
      data: category,
    })

    console.log(`✅ Categoría "${category.name}" creada`)
  }

  console.log('🎉 Seed de categorías de servicios completado!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
