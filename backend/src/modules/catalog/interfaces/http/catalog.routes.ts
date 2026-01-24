import { Router } from 'express'
import {
  getProductByIdController,
  searchProductsController,
  searchWorkshopsController,
  searchServicesController,
  getCategoriesController,
} from '../controllers/catalog.controller'

const r = Router()

// GET /api/catalog/categories
r.get('/categories', getCategoriesController)

// GET /api/catalog/workshops
r.get('/workshops', searchWorkshopsController)

// GET /api/catalog/products
r.get('/products', searchProductsController)

// GET /api/catalog/products/:id
r.get('/products/:id', getProductByIdController)

// GET /api/catalog/services
r.get('/services', searchServicesController)

export default r
