import { Router } from 'express'
import {
  getProductByIdController,
  searchProductsController,
  searchWorkshopsController,
  searchServicesController,
  getCategoriesController,
} from '../controllers/catalog.controller'
import { aiSearchController } from '../controllers/ai-search.controller'

const r = Router()

/**
 * @swagger
 * /api/catalog/categories:
 *   get:
 *     summary: Obtener categorías
 *     description: Lista todas las categorías de productos y servicios
 *     tags: [Catalog]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [PRODUCT, SERVICE]
 */
r.get('/categories', getCategoriesController)

/**
 * @swagger
 * /api/catalog/workshops:
 *   get:
 *     summary: Buscar talleres
 *     description: Busca talleres con filtros opcionales
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de talleres
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workshop'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 */
r.get('/workshops', searchWorkshopsController)

/**
 * @swagger
 * /api/catalog/products:
 *   get:
 *     summary: Buscar productos
 *     description: Busca productos en el catálogo con filtros opcionales
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: workshopId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por taller
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
r.get('/products', searchProductsController)

/**
 * @swagger
 * /api/catalog/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Obtiene los detalles de un producto del catálogo
 *     tags: [Catalog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalles del producto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
r.get('/products/:id', getProductByIdController)

/**
 * @swagger
 * /api/catalog/services:
 *   get:
 *     summary: Buscar servicios
 *     description: Busca servicios en el catálogo
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *     responses:
 *       200:
 *         description: Lista de servicios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
r.get('/services', searchServicesController)

/**
 * @swagger
 * /api/catalog/ai-search:
 *   get:
 *     summary: Búsqueda inteligente con IA
 *     description: Interpreta consultas en lenguaje natural usando Gemini AI (gratis) con fallback a parsing local
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Consulta en lenguaje natural (ej. "necesito arreglar mi bici en Palma")
 *     responses:
 *       200:
 *         description: Resultados de búsqueda con contexto de IA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 intent:
 *                   type: string
 *                   enum: [workshops, products, services, rentals, routes]
 *                 filters:
 *                   type: object
 *                 aiMessage:
 *                   type: string
 *                 results:
 *                   type: array
 *                 total:
 *                   type: integer
 */
r.get('/ai-search', aiSearchController)

export default r
