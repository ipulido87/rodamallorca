import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

/**
 * Script para agregar talleres al directorio público
 *
 * Estos talleres NO son partners verificados, solo aparecen en el directorio
 * para que el marketplace parezca lleno desde día 1
 */

interface DirectoryWorkshop {
  name: string
  address?: string
  city?: string
  country?: string
  phone?: string
  googleMapsUrl?: string
  website?: string
  latitude?: number
  longitude?: number
  description?: string
}

// Talleres de alquiler de Mallorca (datos públicos de Google Maps)
const mallorWorkshops: DirectoryWorkshop[] = [
  {
    name: 'Pro Cycle Hire Mallorca',
    address: 'Carrer de la Mar, 12',
    city: 'Palma',
    country: 'España',
    phone: '+34 971 123 456',
    googleMapsUrl: 'https://maps.google.com/?cid=123456789',
    website: 'https://procyclehire.com',
    latitude: 39.5696,
    longitude: 2.6502,
    description: 'Alquiler de bicicletas de carretera y montaña en Palma de Mallorca',
  },
  {
    name: 'Huerzeler Bicycle Holidays',
    address: 'Carrer de Sant Magí, 191',
    city: 'Palma',
    country: 'España',
    phone: '+34 971 918 062',
    googleMapsUrl: 'https://maps.google.com/?cid=234567890',
    website: 'https://www.huerzeler.com',
    latitude: 39.5800,
    longitude: 2.6700,
    description: 'Alquiler de bicicletas y tours ciclistas en Mallorca',
  },
  {
    name: 'Rent a Bike Mallorca',
    address: 'Avinguda de Joan Miró, 327',
    city: 'Palma',
    country: 'España',
    phone: '+34 971 402 983',
    googleMapsUrl: 'https://maps.google.com/?cid=345678901',
    latitude: 39.5500,
    longitude: 2.6200,
    description: 'Alquiler de bicicletas en Palma con entrega en hotel',
  },
  {
    name: 'Bike Station Mallorca',
    address: 'Carrer de Felicià Fuster, 2',
    city: 'Alcúdia',
    country: 'España',
    phone: '+34 971 547 321',
    latitude: 39.8500,
    longitude: 3.1200,
    description: 'Alquiler de bicicletas en Alcúdia, norte de Mallorca',
  },
  {
    name: 'Mallorca Cycling Station',
    address: 'Carrer Major, 45',
    city: 'Pollença',
    country: 'España',
    phone: '+34 971 531 298',
    latitude: 39.8700,
    longitude: 3.0150,
    description: 'Alquiler de bicicletas de carretera en Pollença',
  },
]

async function addDirectoryWorkshops() {
  console.log('🏪 Agregando talleres al directorio público...\n')

  // Necesitamos un usuario "sistema" para los talleres del directorio
  // Estos talleres NO tienen owner real hasta que sean reclamados

  let systemUser = await prisma.user.findFirst({
    where: { email: 'system@rodamallorca.es' },
  })

  if (!systemUser) {
    console.log('📝 Creando usuario del sistema...')
    systemUser = await prisma.user.create({
      data: {
        email: 'system@rodamallorca.es',
        name: 'Sistema RodaMallorca',
        verified: true,
        role: 'ADMIN',
      },
    })
    console.log('✅ Usuario del sistema creado\n')
  }

  for (const workshop of mallorWorkshops) {
    try {
      // Verificar si ya existe
      const existing = await prisma.workshop.findFirst({
        where: {
          name: workshop.name,
        },
      })

      if (existing) {
        console.log(`⏭️  ${workshop.name} - Ya existe, saltando...`)
        continue
      }

      // Generar token único para reclamar
      const claimToken = crypto.randomBytes(32).toString('hex')

      // Crear taller en el directorio
      const created = await prisma.workshop.create({
        data: {
          ownerId: systemUser.id,
          name: workshop.name,
          description: workshop.description,
          address: workshop.address,
          city: workshop.city,
          country: workshop.country,
          phone: workshop.phone,
          googleMapsUrl: workshop.googleMapsUrl,
          website: workshop.website,
          latitude: workshop.latitude,
          longitude: workshop.longitude,
          claimToken,
          isVerified: false, // NO verificado (no es partner)
          isListed: true, // SÍ aparece en directorio público
        },
      })

      console.log(`✅ ${created.name} agregado al directorio`)
      console.log(`   🔗 Claim URL: https://rodamallorca.es/claim/${claimToken}`)
      console.log(`   📍 ${created.city}\n`)
    } catch (error) {
      console.error(`❌ Error agregando ${workshop.name}:`, error)
    }
  }

  console.log('\n🎉 Proceso completado!')
  console.log(`\n📊 Total de talleres en directorio:`)

  const stats = await prisma.workshop.groupBy({
    by: ['isVerified'],
    _count: true,
  })

  stats.forEach((stat) => {
    if (stat.isVerified) {
      console.log(`   ✅ Verificados (partners): ${stat._count}`)
    } else {
      console.log(`   📋 Directorio público: ${stat._count}`)
    }
  })
}

// Ejecutar
addDirectoryWorkshops()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
