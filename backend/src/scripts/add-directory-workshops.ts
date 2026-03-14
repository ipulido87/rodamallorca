import crypto from 'crypto'
import prisma from '../lib/prisma'

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

// Talleres REALES de Mallorca (datos públicos verificados)
const mallorWorkshops: DirectoryWorkshop[] = [
  // === PALMA DE MALLORCA ===
  {
    name: 'Velo Mallorca',
    address: 'Calle Estaca 1',
    city: 'Palma de Mallorca',
    country: 'España',
    phone: '+34 971 059 074',
    website: 'https://velomallorca.net',
    latitude: 39.5696,
    longitude: 2.6502,
    description: 'Boutique de ciclismo exclusiva con estudio biomecánico, taller especializado y montajes a la carta. Las mejores marcas de ciclismo.',
  },
  {
    name: 'NANO Bicycles',
    address: 'Carrer de la Mar 10',
    city: 'Palma de Mallorca',
    country: 'España',
    phone: '+34 971 423 569',
    website: 'https://nanobicycles.com',
    latitude: 39.568,
    longitude: 2.648,
    description: 'Alquiler y taller de bicicletas en el centro de Palma. Especialistas en bicicletas de carretera y gravel.',
  },
  {
    name: 'NANO Bicycles - City Shop',
    address: 'Carrer Apuntadors 6',
    city: 'Palma de Mallorca',
    country: 'España',
    phone: '+34 971 667 360',
    website: 'https://nanobicycles.com',
    latitude: 39.567,
    longitude: 2.649,
    description: 'City bikes, bicicletas para niños, fitness, trekking y e-bikes. Segunda tienda de NANO en el centro.',
  },
  {
    name: 'Jo&Bikes by Joan Amorós',
    address: 'C/ Ignasi Ferretjans, 9, local B y C',
    city: 'Palma de Mallorca',
    country: 'España',
    phone: '+34 871 570 123',
    website: 'https://joandbikes.com',
    latitude: 39.575,
    longitude: 2.655,
    description: 'Distribuidor oficial Factor, Cervélo, Aurum, Orbea, Megamo y Bianchi. Taller especializado multimarca con bikefitting.',
  },
  {
    name: 'Ciclos Gomila - Palma',
    address: 'Calle Setze de Juliol, 78',
    city: 'Palma de Mallorca',
    country: 'España',
    phone: '+34 971 292 255',
    website: 'https://www.ciclosgomila.com',
    latitude: 39.582,
    longitude: 2.662,
    description: 'Tienda de bicicletas Trek en Mallorca. Venta, reparación y alquiler de bicicletas de cualquier tipo.',
  },
  {
    name: 'Berganti Bikes',
    address: 'Avinguda Bartomeu Riutort, 59',
    city: 'Can Pastilla',
    country: 'España',
    phone: '+34 971 744 096',
    website: 'https://bergantibikes.com',
    latitude: 39.525,
    longitude: 2.735,
    description: 'Centro de Servicio Oficial Shimano. Una de las mayores flotas de alquiler en Mallorca, cerca del aeropuerto.',
  },
  {
    name: 'Liberty Sport',
    address: 'Carrer Miguel de Cervantes, 13',
    city: 'Portals Nous',
    country: 'España',
    phone: '+34 971 405 527',
    website: 'https://libertysport.es',
    latitude: 39.535,
    longitude: 2.568,
    description: 'Alquiler y venta de bicicletas de alta calidad. Taller profesional de reparación y mantenimiento preventivo.',
  },

  // === BINISSALEM ===
  {
    name: 'Ciclos Gomila - Binissalem',
    address: 'Calle del Conquistador, 18 - BJ',
    city: 'Binissalem',
    country: 'España',
    phone: '+34 971 511 932',
    website: 'https://www.ciclosgomila.com',
    latitude: 39.687,
    longitude: 2.845,
    description: 'Venta y reparación de bicicletas. Alquiler para excursiones por el interior de Mallorca.',
  },

  // === FELANITX ===
  {
    name: 'Ciclos Gomila - Felanitx',
    address: 'Carrer Joan Capó, 7 Bajo',
    city: 'Felanitx',
    country: 'España',
    phone: '+34 971 580 123',
    website: 'https://www.ciclosgomila.com',
    latitude: 39.47,
    longitude: 3.148,
    description: 'Tienda de bicicletas en el sureste de Mallorca. Venta, reparación y alquiler.',
  },

  // === PUERTO DE ALCUDIA ===
  {
    name: 'Sport Bequi Cycling',
    address: 'Carretera de Artá, 40',
    city: 'Puerto de Alcudia',
    country: 'España',
    phone: '+34 971 545 664',
    website: 'https://sportbequi.com',
    latitude: 39.848,
    longitude: 3.128,
    description: 'Desde 1979 en Alcudia. Alquiler y venta de bicicletas, taller mecánico especializado.',
  },
  {
    name: 'Enjoy Bike Garage & Coffee',
    address: 'Carrer de Xara, 27',
    city: 'Alcudia',
    country: 'España',
    phone: '+34 871 513 547',
    website: 'https://enjoybike.es',
    latitude: 39.852,
    longitude: 3.12,
    description: 'Taller de bicicletas y cafetería ciclista. Experiencia desde 2004 en el sector.',
  },
  {
    name: 'Ecobikes Mallorca - Puerto',
    address: 'Calle de L\'Hosteleria, 7',
    city: 'Puerto de Alcudia',
    country: 'España',
    phone: '+34 605 846 060',
    website: 'https://ecobikesmallorca.com',
    latitude: 39.845,
    longitude: 3.132,
    description: 'Alquiler de bicicletas cerca del puerto deportivo de Alcudia.',
  },

  // === PUERTO DE POLLENSA ===
  {
    name: '2GoCycling',
    address: 'Calle Virgen del Carmen, 92',
    city: 'Puerto de Pollensa',
    country: 'España',
    phone: '+34 971 866 857',
    website: 'https://2gocycling.com',
    latitude: 39.905,
    longitude: 3.082,
    description: 'Más de 1000 bicicletas disponibles. Tours guiados para cualquier nivel cerca del Club Náutico.',
  },
  {
    name: 'Bike Can Rul',
    address: 'Calle Llevant, 40A',
    city: 'Puerto de Pollensa',
    country: 'España',
    phone: '+34 971 867 432',
    website: 'https://bikecanrul.com',
    latitude: 39.903,
    longitude: 3.085,
    description: 'Amplia variedad de marcas para alquiler y venta. Taller mecánico, accesorios y productos energéticos.',
  },
  {
    name: 'Rent March',
    address: 'Carrer de Joan XXIII, 87',
    city: 'Puerto de Pollensa',
    country: 'España',
    phone: '+34 971 864 784',
    website: 'https://rentmarch.com',
    latitude: 39.904,
    longitude: 3.08,
    description: 'Gran stock de bicicletas de carretera, montaña, trekking, urbanas, eléctricas y para niños.',
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
