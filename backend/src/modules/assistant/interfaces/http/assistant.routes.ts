import { Router } from 'express'
import { assistantChatController } from '../controllers/assistant.controller'

const router = Router()

/**
 * @swagger
 * /api/assistant/chat:
 *   post:
 *     summary: Chat asistente de negocio (fase 1)
 *     tags: [Assistant]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *               conversationId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Respuesta del asistente
 */
router.post('/chat', assistantChatController)

export default router
