import { Router, type Request, type Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

const SITE_URL = 'https://rodamallorca.com'

const STATIC_URLS = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/talleres', changefreq: 'daily', priority: '0.9' },
  { loc: '/productos', changefreq: 'daily', priority: '0.9' },
  { loc: '/alquileres', changefreq: 'daily', priority: '0.9' },
  { loc: '/sobre-nosotros', changefreq: 'monthly', priority: '0.7' },
  { loc: '/como-funciona', changefreq: 'monthly', priority: '0.7' },
  { loc: '/rutas-recomendadas', changefreq: 'monthly', priority: '0.6' },
  { loc: '/centro-de-ayuda', changefreq: 'monthly', priority: '0.6' },
]

const toW3CDate = (date: Date) => date.toISOString().split('T')[0]

const buildUrl = (loc: string, opts: { changefreq: string; priority: string; lastmod?: string }) => `
  <url>
    <loc>${SITE_URL}${loc}</loc>
    ${opts.lastmod ? `<lastmod>${opts.lastmod}</lastmod>` : ''}
    <changefreq>${opts.changefreq}</changefreq>
    <priority>${opts.priority}</priority>
  </url>`

router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const [saleProducts, workshops, rentalProducts] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'PUBLISHED', isRental: false },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.workshop.findMany({
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { status: 'PUBLISHED', isRental: true },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    const staticEntries = STATIC_URLS.map((u) =>
      buildUrl(u.loc, { changefreq: u.changefreq, priority: u.priority })
    ).join('')

    const productEntries = saleProducts
      .map((p) =>
        buildUrl(`/product/${p.id}`, {
          changefreq: 'weekly',
          priority: '0.8',
          lastmod: toW3CDate(p.updatedAt),
        })
      )
      .join('')

    const workshopEntries = workshops
      .map((w) =>
        buildUrl(`/workshop/${w.id}`, {
          changefreq: 'weekly',
          priority: '0.8',
          lastmod: toW3CDate(w.updatedAt),
        })
      )
      .join('')

    const rentalEntries = rentalProducts
      .map((b) =>
        buildUrl(`/alquileres/${b.id}`, {
          changefreq: 'weekly',
          priority: '0.8',
          lastmod: toW3CDate(b.updatedAt),
        })
      )
      .join('')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${workshopEntries}${productEntries}${rentalEntries}
</urlset>`

    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    })
    res.send(xml)
  } catch (err) {
    console.error('Error generando sitemap:', err)
    res.status(500).send('Error generando sitemap')
  }
})

export default router
