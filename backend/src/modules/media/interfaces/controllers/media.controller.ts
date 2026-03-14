import { Request, Response } from 'express'
import { asyncHandler } from '../../../../utils/async-handler'
import { BadRequestError } from '../../../../lib/helpers/error.helpers'
import { ImageProcessor } from '../../application/image-processor'

const imageProcessor = new ImageProcessor()

export const uploadImages = asyncHandler(async (
  req: Request,
  res: Response
) => {
  console.log('📤 [uploadImages] Recibida solicitud de upload')
  console.log('📤 [uploadImages] Usuario:', req.user)
  console.log('📤 [uploadImages] Archivos recibidos:', req.files)

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    console.log('❌ [uploadImages] No se enviaron archivos')
    throw new BadRequestError('No se enviaron archivos')
  }

  console.log('📤 [uploadImages] Cantidad de archivos:', req.files.length)
  req.files.forEach((file, index) => {
    console.log(`📤 [uploadImages] Archivo ${index + 1}:`, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer
    })
  })

  const uploadPromises = req.files.map((file: Express.Multer.File) =>
    imageProcessor.processImage(file.buffer, file.originalname)
  )

  console.log('📤 [uploadImages] Procesando imágenes...')
  const processedImages = await Promise.all(uploadPromises)

  console.log('✅ [uploadImages] Todas las imágenes procesadas exitosamente')
  res.json({
    message: 'Imágenes subidas correctamente',
    images: processedImages,
  })
})

export const uploadSingleImage = asyncHandler(async (
  req: Request,
  res: Response
) => {
  if (!req.file) {
    throw new BadRequestError('No se envió archivo')
  }

  const processedImage = await imageProcessor.processImage(
    req.file.buffer,
    req.file.originalname
  )

  res.json({
    message: 'Imagen subida correctamente',
    image: processedImage,
  })
})

export const deleteImage = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const { imagePath } = req.body

  if (!imagePath) {
    throw new BadRequestError('Ruta de imagen requerida')
  }

  await imageProcessor.deleteImage(imagePath)

  res.json({ message: 'Imagen eliminada correctamente' })
})
