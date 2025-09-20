import { Router } from 'express'
import prisma from '../../../../lib/prisma'
import {
  searchProductsController,
  searchWorkshopsController,
} from '../controllers/catalog.controller'

const r = Router()

// GET /api/catalog/workshops
r.get('/workshops', searchWorkshopsController)

// GET /api/catalog/products
r.get('/products', searchProductsController)

// GET /api/catalog/products/:id
r.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const product = await prisma.product.findUnique({
      where: {
        id,
        status: 'PUBLISHED',
      },
      include: {
        workshop: {
          select: { id: true, name: true, city: true, country: true },
        },
        category: {
          select: { id: true, name: true },
        },
        images: true,
      },
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.json(product)
  } catch (e) {
    next(e)
  }
})

export default r
