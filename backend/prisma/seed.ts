import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Categorías iniciales
  await prisma.category.createMany({
    data: [
      { name: 'Transmission' },
      { name: 'Brakes' },
      { name: 'Wheels' },
      { name: 'Accessories' },
    ],
    skipDuplicates: true,
  })

  // Usuario dueño del taller
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'Demo Owner',
      verified: true,
    },
  })

  // Taller de ejemplo
  const workshop = await prisma.workshop.upsert({
    where: { id: 'seed-workshop' },
    update: {},
    create: {
      id: 'seed-workshop',
      ownerId: owner.id,
      name: 'Ciclos Mallorca',
      city: 'Palma',
      country: 'ES',
    },
  })

  // Producto de ejemplo
  await prisma.product.create({
    data: {
      workshopId: workshop.id,
      title: 'Shimano XT derailleur',
      price: 7500, // céntimos → 75 €
      condition: 'used',
      status: 'PUBLISHED',
    },
  })
}

main()
  .then(() => console.log('✅ Seed complete'))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
