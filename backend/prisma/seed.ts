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

// ─── Talleres ────────────────────────────────────────────────────────────────
const workshopsData = [
  {
    id: 'seed-workshop-01',
    email: 'owner01@rodamallorca.es',
    name: 'Ciclos Mallorca',
    city: 'Palma',
    address: 'Carrer del Sindicat, 45, 07002 Palma',
    phone: '+34 971 123 456',
    description:
      'Taller de bicicletas en el centro de Palma con más de 15 años de experiencia. Especialistas en reparación, mantenimiento y venta de recambios para todo tipo de bicicletas. Atendemos bicicletas de carretera, mountain bike, urbanas y eléctricas.',
    website: 'https://ciclosmallorca.es',
    googleMapsUrl: 'https://maps.google.com/?q=Carrer+del+Sindicat+45+Palma',
    isVerified: true,
    isListed: true,
    averageRating: 4.8,
    reviewCount: 127,
    latitude: 39.5696,
    longitude: 2.6502,
  },
  {
    id: 'seed-workshop-02',
    email: 'owner02@rodamallorca.es',
    name: 'Veloce Cycling Palma',
    city: 'Palma',
    address: 'Avinguda de Joan Miró, 210, 07015 Palma',
    phone: '+34 971 234 567',
    description:
      'Tienda y taller especializado en ciclismo de carretera y triatlón. Contamos con el mejor equipo de mecánicos para puesta a punto de tu bici antes de cualquier ruta por Mallorca. Alquiler de bicicletas de carretera de alta gama para ciclistas que visitan la isla.',
    website: 'https://velocecycling.es',
    googleMapsUrl: 'https://maps.google.com/?q=Avinguda+Joan+Miro+210+Palma',
    isVerified: true,
    isListed: true,
    averageRating: 4.9,
    reviewCount: 214,
    latitude: 39.5534,
    longitude: 2.6178,
  },
  {
    id: 'seed-workshop-03',
    email: 'owner03@rodamallorca.es',
    name: 'MTB Mallorca Sóller',
    city: 'Sóller',
    address: 'Carrer de Sa Lluna, 12, 07100 Sóller',
    phone: '+34 971 345 678',
    description:
      'El taller de referencia para el mountain bike en la Serra de Tramuntana. Reparación de suspensiones, transmisiones y frenos hidráulicos. Guías locales para rutas de MTB por los mejores senderos de Mallorca. Alquiler de MTB de doble suspensión.',
    website: 'https://mtbmallorca.com',
    googleMapsUrl: 'https://maps.google.com/?q=Carrer+Sa+Lluna+12+Soller',
    isVerified: true,
    isListed: true,
    averageRating: 4.7,
    reviewCount: 89,
    latitude: 39.7664,
    longitude: 2.7149,
  },
  {
    id: 'seed-workshop-04',
    email: 'owner04@rodamallorca.es',
    name: 'BiciPort Alcúdia',
    city: 'Alcúdia',
    address: 'Carrer del Moll, 8, 07400 Alcúdia',
    phone: '+34 971 456 789',
    description:
      'Taller y alquiler de bicicletas en el Puerto de Alcúdia. Perfecta ubicación para explorar el norte de Mallorca en bici. Flota de bicicletas eléctricas, de carretera y de ciudad disponibles por días o semanas. Servicio de entrega en hotel.',
    website: 'https://biciportalcudia.es',
    googleMapsUrl: 'https://maps.google.com/?q=Carrer+del+Moll+8+Alcudia',
    isVerified: true,
    isListed: true,
    averageRating: 4.6,
    reviewCount: 156,
    latitude: 39.8517,
    longitude: 3.1272,
  },
  {
    id: 'seed-workshop-05',
    email: 'owner05@rodamallorca.es',
    name: 'Ciclisme Pollença',
    city: 'Pollença',
    address: 'Plaça Major, 3, 07460 Pollença',
    phone: '+34 971 567 890',
    description:
      'Pequeño taller familiar en el corazón de Pollença. Especialistas en bicicletas clásicas y restauración. También reparamos bicicletas modernas de carretera y urbanas. Conocemos cada rincón de las rutas ciclistas del norte de Mallorca.',
    isVerified: false,
    isListed: true,
    averageRating: 4.5,
    reviewCount: 43,
    latitude: 39.8782,
    longitude: 3.0143,
  },
  {
    id: 'seed-workshop-06',
    email: 'owner06@rodamallorca.es',
    name: 'Bici Inca Center',
    city: 'Inca',
    address: 'Carrer Major, 67, 07300 Inca',
    phone: '+34 971 678 901',
    description:
      'Taller en el centro de Mallorca, a dos pasos del mercado de Inca. Gran stock de recambios y componentes para bicicletas de carretera, MTB y e-bike. Reparaciones express en el día. Presupuesto sin compromiso.',
    isVerified: false,
    isListed: true,
    averageRating: 4.4,
    reviewCount: 67,
    latitude: 39.7197,
    longitude: 2.9121,
  },
  {
    id: 'seed-workshop-07',
    email: 'owner07@rodamallorca.es',
    name: 'Island Bikes Arenal',
    city: "s'Arenal",
    address: "Carrer de les Meravelles, 34, 07600 s'Arenal",
    phone: '+34 971 789 012',
    description:
      'Alquiler y venta de bicicletas en primera línea de playa en s\'Arenal. Ideal para turistas que quieren explorar el Paseo Marítimo y los alrededores. Bicicletas urbanas, eléctricas y familiares. Abierto todos los días de 8h a 20h.',
    isVerified: true,
    isListed: true,
    averageRating: 4.3,
    reviewCount: 201,
    latitude: 39.5008,
    longitude: 2.7412,
  },
  {
    id: 'seed-workshop-08',
    email: 'owner08@rodamallorca.es',
    name: 'Ciclos Manacor',
    city: 'Manacor',
    address: 'Avinguda del Parc, 15, 07500 Manacor',
    phone: '+34 971 890 123',
    description:
      'Taller de referencia en el este de Mallorca. Servicio técnico oficial Specialized y Trek. Amplio catálogo de recambios originales y genéricos. Taller equipado con los últimos avances para diagnóstico y reparación de e-bikes.',
    website: 'https://ciclosmanacor.es',
    isVerified: false,
    isListed: true,
    averageRating: 4.6,
    reviewCount: 78,
    latitude: 39.5680,
    longitude: 3.2090,
  },
]

// ─── Productos por taller ─────────────────────────────────────────────────────
const getProductsForWorkshop = (workshopId: string, categoryIds: Record<string, string>) => {
  const allProducts: Record<string, object[]> = {
    'seed-workshop-01': [
      {
        workshopId,
        title: 'Grupo Shimano 105 R7000 11v - Segunda mano',
        description: 'Grupo Shimano 105 R7000 de 11 velocidades en perfecto estado. Incluye bielas 50/34 con eje, cassette 11-28, desviador delantero y trasero, manetas de cambio/freno y frenos de zapata. Muy pocas horas de uso. Ideal para road bike de temporada.',
        price: 28000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Transmisión'],
      },
      {
        workshopId,
        title: 'Rueda trasera Mavic Ksyrium Elite - Ocasión',
        description: 'Rueda trasera Mavic Ksyrium Elite en aluminio, 700c, cubierta. Rodamientos revisados y en perfecto estado. Radios y llanta sin daños. Compatible con grupos Shimano/SRAM (cassette no incluido). Una de las mejores ruedas de aluminio del mercado.',
        price: 12000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Ruedas'],
      },
      {
        workshopId,
        title: 'Casco Giro Synthe MIPS Talla M - Como nuevo',
        description: 'Casco Giro Synthe MIPS talla M (55-59cm) en color blanco/azul. Apenas usado, sin golpes ni daños. Sistema MIPS para mayor protección. Uno de los cascos más aerodinámicos y ventilados del mercado. Incluye funda original.',
        price: 15000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Accesorios'],
      },
      {
        workshopId,
        title: 'Potencia FSA Gossamer 100mm - Usada',
        description: 'Potencia FSA Gossamer de 100mm, ángulo -6°, attache 31.8mm. Aluminio 6061. En perfecto estado, limpiada y revisada. Compatible con cualquier horquilla de 1-1/8".',
        price: 3500,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Componentes'],
      },
    ],
    'seed-workshop-02': [
      {
        workshopId,
        title: 'Alquiler Bicicleta Carretera Cervélo S3',
        description: 'Alquila una Cervélo S3 con cuadro de carbono y grupo Shimano Ultegra Di2. Bicicleta top usada por ciclistas profesionales que visitan Mallorca. Incluye pedales SPD-SL, casco y kit de reparación. Entrega y recogida en el taller o en tu hotel de Palma.',
        price: 0,
        condition: 'new',
        status: 'PUBLISHED',
        isRental: true,
        rentalPricePerDay: 7500,
        rentalPricePerWeek: 42000,
        availableQuantity: 5,
        minRentalDays: 1,
        maxRentalDays: 14,
        depositAmount: 30000,
        bikeType: 'road',
        bikeBrand: 'Cervélo',
        bikeModel: 'S3',
        includesHelmet: true,
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Alquiler Bicicleta Carretera Trek Émonda',
        description: 'Trek Émonda AL 5 con cuadro de aluminio y grupo Shimano 105. Perfecta para recorrer las rutas ciclistas más famosas de Mallorca: Sa Calobra, Cap Formentor y Puig Major. Incluye pedales automáticos y bolsa de sillín.',
        price: 0,
        condition: 'new',
        status: 'PUBLISHED',
        isRental: true,
        rentalPricePerDay: 5500,
        rentalPricePerWeek: 30000,
        availableQuantity: 8,
        minRentalDays: 1,
        maxRentalDays: 21,
        depositAmount: 20000,
        bikeType: 'road',
        bikeBrand: 'Trek',
        bikeModel: 'Émonda AL 5',
        includesHelmet: true,
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Cuadro Specialized Tarmac SL6 Talla 54 - Segunda mano',
        description: 'Cuadro Specialized Tarmac SL6 en carbono FACT 10r, talla 54cm. Sin golpes ni reparaciones. Geometría de carreras. Compatible con grupos de carretera de 2x. Un cuadro excepcional para construir tu bici soñada.',
        price: 85000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Grupo SRAM Force eTap AXS - Ocasión',
        description: 'Grupo SRAM Force eTap AXS inalámbrico de 12 velocidades. Incluye manetas, desviadores delantero y trasero, cassette 10-36 XG-1270 y bielas con plato 48/35. En excelente estado, con menos de 3.000 km. La electrónica inalámbrica más fiable del mercado.',
        price: 95000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Transmisión'],
      },
    ],
    'seed-workshop-03': [
      {
        workshopId,
        title: 'Alquiler MTB Doble Suspensión Trek Fuel EX',
        description: 'Alquila una Trek Fuel EX 9.7 con doble suspensión y grupo SRAM GX Eagle 12v. Perfecta para las rutas de montaña de la Serra de Tramuntana. Horquilla RockShox Pike 140mm y amortiguador RockShox Deluxe. Disponible en tallas S, M y L.',
        price: 0,
        condition: 'new',
        status: 'PUBLISHED',
        isRental: true,
        rentalPricePerDay: 6500,
        rentalPricePerWeek: 36000,
        availableQuantity: 4,
        minRentalDays: 1,
        maxRentalDays: 7,
        depositAmount: 25000,
        bikeType: 'mountain',
        bikeBrand: 'Trek',
        bikeModel: 'Fuel EX 9.7',
        includesHelmet: true,
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Horquilla RockShox Pike RCT3 150mm - Usada',
        description: 'Horquilla RockShox Pike RCT3 de 150mm de recorrido, eje Boost 110x15mm, dirección 1-1/8" a 1.5" tapered. Revisada y con servicio de aceite recién hecho. Funcionamiento impecable. Compatible con ruedas de 27.5" y 29".',
        price: 32000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Componentes'],
      },
      {
        workshopId,
        title: 'Grupo SRAM GX Eagle 12v completo - Segunda mano',
        description: 'Grupo SRAM GX Eagle de 12 velocidades completo: maneta, desviador trasero, cassette 10-52 dientes, cadena y bielas con plato 32T. Perfecto estado tras revisión en taller. El grupo de referencia para MTB de nivel medio-alto.',
        price: 28000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Transmisión'],
      },
      {
        workshopId,
        title: 'Frenos hidráulicos Shimano Saint 4 pistones - Ocasión',
        description: 'Set de frenos hidráulicos Shimano Saint de 4 pistones (delanero + trasero). Pastillas al 70% de vida. Latiguillos en perfecto estado. Purgados recientemente. La mejor opción para descenso y enduro exigente.',
        price: 18000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Frenos'],
      },
    ],
    'seed-workshop-04': [
      {
        workshopId,
        title: 'Alquiler Bicicleta Eléctrica Riese & Müller',
        description: 'Alquila una e-bike premium Riese & Müller con motor Bosch Performance Line CX y batería de 500Wh. Autonomía de hasta 100km. Perfecta para explorar el norte de Mallorca sin esfuerzo: Alcúdia, Pollença, Cap de Formentor y la Albufera. Servicio de entrega en hotel.',
        price: 0,
        condition: 'new',
        status: 'PUBLISHED',
        isRental: true,
        rentalPricePerDay: 5000,
        rentalPricePerWeek: 28000,
        availableQuantity: 6,
        minRentalDays: 1,
        maxRentalDays: 14,
        depositAmount: 30000,
        bikeType: 'electric',
        bikeBrand: 'Riese & Müller',
        bikeModel: 'Supercharger3',
        includesHelmet: true,
        includesLock: true,
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Alquiler Bicicleta Ciudad Electrica Orbea Vibe',
        description: 'Orbea Vibe H30 con motor Mahle X35+ y 360Wh de batería integrada en el cuadro. Diseño discreto y urbano. Ideal para moverse por el casco histórico de Alcúdia y sus alrededores. Incluye candado y cesta delantera.',
        price: 0,
        condition: 'new',
        status: 'PUBLISHED',
        isRental: true,
        rentalPricePerDay: 3500,
        rentalPricePerWeek: 19000,
        availableQuantity: 10,
        minRentalDays: 1,
        maxRentalDays: 30,
        depositAmount: 15000,
        bikeType: 'electric',
        bikeBrand: 'Orbea',
        bikeModel: 'Vibe H30',
        includesHelmet: false,
        includesLock: true,
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Motor Bosch Performance CX Gen4 - Segunda mano',
        description: 'Motor Bosch Performance Line CX de 4ª generación, 85Nm de par, 250W de potencia nominal. Extraído de bicicleta accidentada, el motor está en perfecto funcionamiento. Compatible con marcos Bosch Active Line/Performance Line de 2020 en adelante.',
        price: 55000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Electrónica'],
      },
    ],
    'seed-workshop-05': [
      {
        workshopId,
        title: 'Bicicleta urbana Peugeot clásica restaurada',
        description: 'Bicicleta Peugeot de los años 80 completamente restaurada. Cuadro de acero cromado relacado, cambios Simplex, frenos Mafac, sillín Brooks B17. Una joya para el día a día o para coleccionistas. Única en su tipo.',
        price: 45000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Alquiler Bicicleta Carretera Aluminio',
        description: 'Bicicleta de carretera de aluminio con grupo Shimano Tiagra 2x10. Perfecta para recorrer las rutas del norte de Mallorca: Cap de Formentor, Cala Sant Vicenç y el interior de Pollença. Disponible en tallas 50, 52, 54 y 56cm.',
        price: 0,
        condition: 'new',
        status: 'PUBLISHED',
        isRental: true,
        rentalPricePerDay: 3000,
        rentalPricePerWeek: 17000,
        availableQuantity: 3,
        minRentalDays: 1,
        maxRentalDays: 14,
        depositAmount: 10000,
        bikeType: 'road',
        includesHelmet: true,
        categoryId: categoryIds['Bicicletas'],
      },
    ],
    'seed-workshop-06': [
      {
        workshopId,
        title: 'Cassette Shimano Ultegra R8000 11-28 - Usada',
        description: 'Cassette Shimano Ultegra R8000 de 11 velocidades, rango 11-28. Con menos de 2000km. Cadena no incluida. Compatible con rueda libre de 11v Shimano/SRAM. Ideal para renovar la transmisión de tu carretera sin gastar una fortuna.',
        price: 4500,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Transmisión'],
      },
      {
        workshopId,
        title: 'Manillar carbono FSA K-Force 42cm - Ocasión',
        description: 'Manillar de carbono FSA K-Force, anchura 42cm, drop compacto. Peso de solo 188 gramos. Sin grietas ni marcas de potencia. El upgrade definitivo para reducir peso en tu bici de carretera.',
        price: 8500,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Componentes'],
      },
      {
        workshopId,
        title: 'Sillín Fizik Antares R3 - Segunda mano',
        description: 'Sillín Fizik Antares R3 con raíles de carbono, color negro. Anchura 00 (143mm). Poco uso, en perfecto estado. Uno de los sillines de referencia para ciclismo de carretera de nivel medio-alto.',
        price: 7500,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Componentes'],
      },
    ],
    'seed-workshop-07': [
      {
        workshopId,
        title: 'Alquiler Bici Eléctrica Ciudad por días',
        description: 'Bicicleta eléctrica urbana para recorrer el Paseo Marítimo de s\'Arenal y Can Pastilla. Motor trasero de 250W, batería de 14Ah y pantalla LCD. Incluye candado y casco. Perfecta para turistas y familias.',
        price: 0,
        condition: 'new',
        status: 'PUBLISHED',
        isRental: true,
        rentalPricePerDay: 3000,
        rentalPricePerWeek: 16000,
        availableQuantity: 12,
        minRentalDays: 1,
        maxRentalDays: 30,
        depositAmount: 10000,
        bikeType: 'electric',
        includesHelmet: true,
        includesLock: true,
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Alquiler Bicicleta Infantil 20 pulgadas',
        description: 'Bicicleta infantil de 20 pulgadas para niños de 6 a 10 años. Con ruedines opcionales. Perfecta para que los más pequeños de la familia disfruten del paseo marítimo junto a sus padres. También disponemos de tallas 16".',
        price: 0,
        condition: 'new',
        status: 'PUBLISHED',
        isRental: true,
        rentalPricePerDay: 1500,
        rentalPricePerWeek: 8000,
        availableQuantity: 8,
        minRentalDays: 1,
        maxRentalDays: 14,
        depositAmount: 5000,
        bikeType: 'city',
        includesHelmet: true,
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Luces Garmin Varia RTL515 radar trasero - Usado',
        description: 'Radar y luz trasera Garmin Varia RTL515. Detecta vehículos hasta 140 metros y alerta al ciclocomputador Garmin. Batería con 16h de autonomía en modo intermitente. En perfecto estado con su soporte y cable de carga.',
        price: 8500,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Accesorios'],
      },
    ],
    'seed-workshop-08': [
      {
        workshopId,
        title: 'Bicicleta Specialized Stumpjumper 2021 Talla M',
        description: 'Specialized Stumpjumper Comp Alloy 2021, talla M. Suspensión delantera 140mm (Fox Rhythm 34), grupo SRAM NX Eagle 12v, frenos Shimano SLX de 4 pistones. En excelente estado con menos de 1.500km. Revisada y lista para salir a la montaña.',
        price: 185000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Cuadro Trek Domane SL5 Talla 56 - Segunda mano',
        description: 'Cuadro Trek Domane SL5 de carbono con IsoSpeed desacoplado. Talla 56cm. Color Matte Dnister Black. Sin golpes ni reparaciones. Perfecto para cicloturismo de largo recorrido. Compatible con grupo de 2x road.',
        price: 110000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Bicicletas'],
      },
      {
        workshopId,
        title: 'Ruedas carbono Zipp 303 Firecrest - Ocasión',
        description: 'Par de ruedas de carbono Zipp 303 Firecrest, profundidad 45mm, anchura interna 23mm. Compatibles con cubierta o tubeless. Hub Zipp en perfecto estado. Con más de 5.000km pero en excelente estado visual y de rodamiento. Sin deformaciones ni impactos.',
        price: 135000,
        condition: 'used',
        status: 'PUBLISHED',
        categoryId: categoryIds['Ruedas'],
      },
    ],
  }

  return allProducts[workshopId] || []
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // Categorías de productos
  console.log('📦 Creando categorías de productos...')
  await prisma.category.createMany({
    data: [
      { name: 'Bicicletas' },
      { name: 'Componentes' },
      { name: 'Accesorios' },
      { name: 'Repuestos' },
      { name: 'Ruedas' },
      { name: 'Frenos' },
      { name: 'Transmisión' },
      { name: 'Electrónica' },
      { name: 'Ropa y Calzado' },
    ],
    skipDuplicates: true,
  })

  // Categorías de servicios
  console.log('🔧 Creando categorías de servicios...')
  for (const category of serviceCategories) {
    const existing = await prisma.serviceCategory.findUnique({
      where: { name: category.name },
    })
    if (existing) {
      console.log(`⏭️  Categoría "${category.name}" ya existe, omitiendo...`)
      continue
    }
    await prisma.serviceCategory.create({ data: category })
    console.log(`✅ Categoría "${category.name}" creada`)
  }

  // Recuperar IDs de categorías de producto
  const categories = await prisma.category.findMany()
  const categoryIds = Object.fromEntries(categories.map((c) => [c.name, c.id]))

  // Talleres y productos
  console.log('🏪 Creando talleres de ejemplo...')
  for (const ws of workshopsData) {
    const { email, ...workshopFields } = ws

    // Crear usuario propietario
    const owner = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: `Propietario ${ws.name}`, verified: true },
    })

    // Crear taller
    await prisma.workshop.upsert({
      where: { id: ws.id },
      update: {},
      create: { ...workshopFields, ownerId: owner.id },
    })

    console.log(`✅ Taller "${ws.name}" en ${ws.city} creado`)

    // Crear productos solo si el taller no tiene aún
    const existingProducts = await prisma.product.count({ where: { workshopId: ws.id } })
    if (existingProducts === 0) {
      const products = getProductsForWorkshop(ws.id, categoryIds)
      for (const product of products) {
        await prisma.product.create({ data: product as Parameters<typeof prisma.product.create>[0]['data'] })
      }
      console.log(`  📦 ${products.length} productos creados para ${ws.name}`)
    } else {
      console.log(`  ⏭️  ${ws.name} ya tiene productos, omitiendo...`)
    }
  }

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .then(() => console.log('✅ Base de datos inicializada'))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
