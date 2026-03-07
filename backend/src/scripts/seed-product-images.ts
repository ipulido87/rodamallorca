/**
 * seed-product-images.ts
 *
 * Añade imágenes de stock a todos los productos que NO tienen ninguna imagen.
 * Mapea la categoría del producto → URL de foto de stock de Unsplash.
 *
 * Las 3 URLs (original / medium / thumbnail) apuntan a la misma foto
 * con tamaños distintos vía el parámetro `w=` de Unsplash CDN.
 *
 * Uso:
 *   npx tsx src/scripts/seed-product-images.ts
 *   npx tsx src/scripts/seed-product-images.ts --dry-run   (no escribe en BD)
 *
 * Para reemplazar con tus propias fotos de Cloudinary:
 *   - Sube las fotos a Cloudinary
 *   - Sustituye las URLs en CATEGORY_IMAGES por tus URLs de Cloudinary
 */

import prisma from '../lib/prisma'

const DRY_RUN = process.argv.includes('--dry-run')

// ─── Imágenes de stock por categoría ──────────────────────────────────────────
// Unsplash CDN: https://images.unsplash.com/photo-{id}?w={w}&h={h}&fit=crop&q=80
// Para cambiar a Cloudinary: sustituye por tus URLs res.cloudinary.com/...

type StockImage = { original: string; medium: string; thumbnail: string }

function unsplash(id: string): StockImage {
  const base = `https://images.unsplash.com/photo-${id}`
  return {
    original:  `${base}?w=1200&h=900&fit=crop&q=80`,
    medium:    `${base}?w=800&h=600&fit=crop&q=80`,
    thumbnail: `${base}?w=400&h=300&fit=crop&q=80`,
  }
}

const CATEGORY_IMAGES: Record<string, StockImage> = {
  'Bicicletas':     unsplash('1558618666-fcd25c85cd64'),   // road cyclist
  'Componentes':    unsplash('1485965100581-3ef8f3be6f2e'), // bike detail / parts
  'Accesorios':     unsplash('1544919982-b61976f0ba43'),    // cycling helmet & gear
  'Repuestos':      unsplash('1530143584347-884aeabb49b5'), // bike chain / drivetrain
  'Ruedas':         unsplash('1571068316344-75bc76f77890'), // bike wheels
  'Frenos':         unsplash('1544191696-15693072e0de'),    // MTB close-up
  'Transmisión':    unsplash('1541625602330-2d90db47ef38'), // cyclist rear cassette
  'Electrónica':    unsplash('1520175480921-4edfa2322086'), // e-bike / tech
  'Ropa y Calzado': unsplash('1469395446868-fb99a1a25283'), // cycling jersey
}

// Imagen por defecto para categorías no mapeadas o sin categoría
const DEFAULT_IMAGE: StockImage = unsplash('1517649763962-0c623066013b') // cyclist group

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📸 seed-product-images ${DRY_RUN ? '[DRY RUN]' : ''}\n`)

  // Productos sin ninguna imagen
  const products = await prisma.product.findMany({
    where: { images: { none: {} } },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  })

  console.log(`Productos sin imagen: ${products.length}`)

  if (products.length === 0) {
    console.log('✅ Todos los productos ya tienen imagen.')
    return
  }

  let inserted = 0

  for (const product of products) {
    const categoryName = product.category?.name ?? ''
    const stockImg = CATEGORY_IMAGES[categoryName] ?? DEFAULT_IMAGE

    console.log(
      `  → [${categoryName || 'sin categoría'}] "${product.title.slice(0, 50)}"`,
    )

    if (!DRY_RUN) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          original:  stockImg.original,
          medium:    stockImg.medium,
          thumbnail: stockImg.thumbnail,
          position:  0,
        },
      })
      inserted++
    }
  }

  if (DRY_RUN) {
    console.log(`\n⚡ DRY RUN: se habrían insertado ${products.length} imágenes.`)
  } else {
    console.log(`\n✅ ${inserted} imágenes insertadas correctamente.`)
  }
}

async function run() {
  try {
    await main()
  } catch (err) {
    console.error('❌ Error:', err)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void run()
