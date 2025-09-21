import { Router } from 'express'
import {
  getProductByIdController,
  searchProductsController,
  searchWorkshopsController,
} from '../controllers/catalog.controller'

const r = Router()

// GET /api/catalog/workshops
r.get('/workshops', searchWorkshopsController)

// GET /api/catalog/products
r.get('/products', searchProductsController)

// GET /api/catalog/products/:id
r.get('/products/:id', getProductByIdController)

export default r
