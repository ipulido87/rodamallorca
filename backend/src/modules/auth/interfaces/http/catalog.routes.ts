import { Router } from 'express'
import { createProductDraft } from '../../application/create-product'
import { createWorkshop } from '../../application/create-workshop'
import { ProductRepositoryPrisma } from '../../infrastructure/persistence/prisma/product-repository-prisma'
import { WorkshopRepositoryPrisma } from '../../infrastructure/persistence/prisma/workshop-repository-prisma'

const router = Router()
const productRepo = new ProductRepositoryPrisma()
const workshopRepo = new WorkshopRepositoryPrisma()

router.post('/workshops', async (req, res, next) => {
  try {
    const ws = await createWorkshop(req.body, { repo: workshopRepo })
    res.status(201).json(ws)
  } catch (e) {
    next(e)
  }
})

router.post('/products', async (req, res, next) => {
  try {
    const p = await createProductDraft(req.body, { repo: productRepo })
    res.status(201).json(p)
  } catch (e) {
    next(e)
  }
})

export default router
