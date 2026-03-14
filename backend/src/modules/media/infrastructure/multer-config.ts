import { Request } from 'express'
import multer from 'multer'

const storage = multer.memoryStorage()

const UNSUPPORTED_MIME_TYPES = new Set(['image/heic', 'image/heif'])

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (UNSUPPORTED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    cb(new Error('El formato HEIC/HEIF (fotos de iPhone) no está soportado. Por favor convierte la imagen a JPG o PNG antes de subirla.'))
    return
  }
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos de imagen'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
})
