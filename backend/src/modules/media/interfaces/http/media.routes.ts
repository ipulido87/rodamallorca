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

// Solo WORKSHOP_OWNER puede subir imágenes
router.post(
  '/upload/multiple',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  upload.array('images', 5), // Máximo 5 imágenes
  uploadImages
)

router.post(
  '/upload/single',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  upload.single('image'),
  uploadSingleImage
)

router.delete(
  '/delete',
  verifyToken,
  requireUser,
  requireRole('WORKSHOP_OWNER'),
  deleteImage
)

export default router
