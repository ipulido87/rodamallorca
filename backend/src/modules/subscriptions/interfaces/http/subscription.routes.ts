import { Router } from 'express'
import { verifyToken, requireUser } from '../../../auth/interfaces/middlewares/auth.middleware'
import { validateBody } from '../../../auth/interfaces/middlewares/validate-body'
import * as subscriptionController from '../controllers/subscription.controller'
import {
  CreateCheckoutSessionSchema,
  CancelSubscriptionSchema,
  CreatePortalSessionSchema,
} from './schemas/subscription.schemas'

const router = Router()

/**
 * @swagger
 * /api/subscriptions/checkout:
 *   post:
 *     summary: Crear checkout de suscripción
 *     description: Inicia el proceso de suscripción mediante Stripe
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workshopId
 *               - planId
 *             properties:
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *               planId:
 *                 type: string
 *                 description: ID del plan de suscripción
 *               successUrl:
 *                 type: string
 *                 format: uri
 *               cancelUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Sesión de checkout creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                 url:
 *                   type: string
 *                   format: uri
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post(
  '/checkout',
  verifyToken,
  requireUser,
  validateBody(CreateCheckoutSessionSchema),
  subscriptionController.createCheckoutSessionController
)

/**
 * @swagger
 * /api/subscriptions/cancel:
 *   post:
 *     summary: Cancelar suscripción
 *     description: Cancela la suscripción de un taller
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workshopId
 *             properties:
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Suscripción cancelada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         description: No hay suscripción activa
 */
router.post(
  '/cancel',
  verifyToken,
  requireUser,
  validateBody(CancelSubscriptionSchema),
  subscriptionController.cancelSubscriptionController
)

/**
 * @swagger
 * /api/subscriptions/status/{workshopId}:
 *   get:
 *     summary: Obtener estado de suscripción
 *     description: Obtiene el estado actual de la suscripción de un taller
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workshopId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estado de la suscripción
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [ACTIVE, CANCELED, PAST_DUE, TRIALING, INACTIVE]
 *                 plan:
 *                   type: string
 *                 currentPeriodEnd:
 *                   type: string
 *                   format: date-time
 *                 cancelAtPeriodEnd:
 *                   type: boolean
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/status/:workshopId',
  verifyToken,
  requireUser,
  subscriptionController.getSubscriptionStatusController
)

/**
 * @swagger
 * /api/subscriptions/portal:
 *   post:
 *     summary: Crear portal de facturación
 *     description: Genera un link al portal de facturación de Stripe para gestionar la suscripción
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workshopId
 *             properties:
 *               workshopId:
 *                 type: string
 *                 format: uuid
 *               returnUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: URL del portal creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/portal',
  verifyToken,
  requireUser,
  validateBody(CreatePortalSessionSchema),
  subscriptionController.createPortalSessionController
)

export default router
