import { Router } from 'express'
import {
  searchProductsController,
  searchWorkshopsController,
} from '../controllers/catalog.controller'

const r = Router()

// GET /api/catalog/workshops
r.get('/workshops', searchWorkshopsController)

// GET /api/catalog/products
r.get('/products', searchProductsController)

export default r
