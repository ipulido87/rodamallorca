// backend/src/modules/customers/interfaces/http/customer.routes.ts
import { Router } from 'express'
import { verifyToken } from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody, validateParams } from '../../../auth/interfaces/middlewares/validate-body'
import {
  getCustomersController,
  getCustomerByIdController,
  createCustomerController,
  updateCustomerController,
  deleteCustomerController,
} from './customer.controller'
import { CreateCustomerSchema, UpdateCustomerSchema } from './schemas/customer.schemas'
import { UuidParamSchema } from '../../../../lib/schemas/common.schemas'

const router = Router()

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Listar clientes
 *     description: Obtiene la lista de clientes del usuario
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   type:
 *                     type: string
 *                     enum: [INDIVIDUAL, BUSINESS]
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   taxId:
 *                     type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Crear cliente
 *     description: Crea un nuevo cliente
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [INDIVIDUAL, BUSINESS]
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               taxId:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/', verifyToken, getCustomersController)
router.post('/', verifyToken, validateBody(CreateCustomerSchema), createCustomerController)

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     description: Obtiene los detalles de un cliente específico
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalles del cliente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Actualizar cliente
 *     description: Actualiza los datos de un cliente
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               taxId:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Eliminar cliente
 *     description: Elimina un cliente
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cliente eliminado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', verifyToken, validateParams(UuidParamSchema), getCustomerByIdController)
router.put('/:id', verifyToken, validateParams(UuidParamSchema), validateBody(UpdateCustomerSchema), updateCustomerController)
router.delete('/:id', verifyToken, validateParams(UuidParamSchema), deleteCustomerController)

export default router
