import { NextFunction, Request, Response } from 'express'
import { ImageProcessor } from '../../application/image-processor'

const imageProcessor = new ImageProcessor()

export const uploadImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('📤 [uploadImages] Recibida solicitud de upload')
    console.log('📤 [uploadImages] Usuario:', req.user)
    console.log('📤 [uploadImages] Archivos recibidos:', req.files)

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.log('❌ [uploadImages] No se enviaron archivos')
      return res.status(400).json({ error: 'No se enviaron archivos' })
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
  } catch (error) {
    console.error('❌ [uploadImages] Error:', error)
    if (error instanceof Error) {
      console.error('❌ [uploadImages] Error stack:', error.stack)
      console.error('❌ [uploadImages] Error message:', error.message)
    }
    res.status(500).json({ error: 'Error al procesar las imágenes' })
  }
}

export const uploadSingleImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió archivo' })
    }

    const processedImage = await imageProcessor.processImage(
      req.file.buffer,
      req.file.originalname
    )

    res.json({
      message: 'Imagen subida correctamente',
      image: processedImage,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({ error: 'Error al procesar la imagen' })
  }
}

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { imagePath } = req.body

    if (!imagePath) {
      return res.status(400).json({ error: 'Ruta de imagen requerida' })
    }

    await imageProcessor.deleteImage(imagePath)

    res.json({ message: 'Imagen eliminada correctamente' })
  } catch (error) {
    console.error('Error deleting image:', error)
    res.status(500).json({ error: 'Error al eliminar la imagen' })
  }
}
