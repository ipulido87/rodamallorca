import { NextFunction, Request, Response } from 'express'
import { ImageProcessor } from '../../application/image-processor'

const imageProcessor = new ImageProcessor()

export const uploadImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron archivos' })
    }

    const uploadPromises = req.files.map((file: Express.Multer.File) =>
      imageProcessor.processImage(file.buffer, file.originalname)
    )

    const processedImages = await Promise.all(uploadPromises)

    res.json({
      message: 'Imágenes subidas correctamente',
      images: processedImages,
    })
  } catch (error) {
    console.error('Error uploading images:', error)
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
