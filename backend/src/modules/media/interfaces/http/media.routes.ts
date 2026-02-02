import { Router } from 'express'
import {
  requireRole,
  requireUser,
  verifyToken,
} from '../../../auth/interfaces/middlewares/auth.middleware'
import { upload } from '../../infrastructure/multer-config'
import {
  deleteImage,
  uploadImages,
  uploadSingleImage,
} from '../controllers/media.controller'

const router = Router()

/**
 * @swagger
 * /api/media/upload/multiple:
 *   post:
 *     summary: Subir múltiples imágenes
 *     description: Sube hasta 5 imágenes a Cloudinary (solo WORKSHOP_OWNER)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *     responses:
 *       200:
 *         description: Imágenes subidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uri
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       400:
 *         description: Error en la subida o formato inválido
 */
router.post(
  '/upload/multiple',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  upload.array('images', 5),
  uploadImages
)

/**
 * @swagger
 * /api/media/upload/single:
 *   post:
 *     summary: Subir una imagen
 *     description: Sube una imagen a Cloudinary (solo WORKSHOP_OWNER)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen subida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   format: uri
 *                 publicId:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/upload/single',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  upload.single('image'),
  uploadSingleImage
)

/**
 * @swagger
 * /api/media/delete:
 *   delete:
 *     summary: Eliminar imagen
 *     description: Elimina una imagen de Cloudinary (solo WORKSHOP_OWNER)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicId
 *             properties:
 *               publicId:
 *                 type: string
 *                 description: ID público de la imagen en Cloudinary
 *     responses:
 *       200:
 *         description: Imagen eliminada
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Imagen no encontrada
 */
router.delete(
  '/delete',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  deleteImage
)

export default router
