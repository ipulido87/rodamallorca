import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import cloudinary from '../../../config/cloudinary.config'

export interface ProcessedImage {
  original: string
  medium: string
  thumbnail: string
}

export class ImageProcessor {
  async processImage(
    buffer: Buffer,
    originalName: string
  ): Promise<ProcessedImage> {
    const fileId = uuidv4()

    // Procesar las 3 versiones de la imagen
    const [originalBuffer, mediumBuffer, thumbnailBuffer] = await Promise.all([
      sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer(),

      sharp(buffer)
        .resize(600, 600, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer(),

      sharp(buffer)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer(),
    ])

    // Subir a Cloudinary en paralelo
    const [originalResult, mediumResult, thumbnailResult] = await Promise.all([
      this.uploadToCloudinary(originalBuffer, `${fileId}_original`),
      this.uploadToCloudinary(mediumBuffer, `${fileId}_medium`),
      this.uploadToCloudinary(thumbnailBuffer, `${fileId}_thumb`),
    ])

    return {
      original: originalResult.secure_url,
      medium: mediumResult.secure_url,
      thumbnail: thumbnailResult.secure_url,
    }
  }

  private uploadToCloudinary(buffer: Buffer, publicId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'roda-mallorca',
          public_id: publicId,
          resource_type: 'image',
          format: 'webp',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extraer public_id de la URL de Cloudinary
      const urlParts = imageUrl.split('/')
      const filename = urlParts[urlParts.length - 1].split('.')[0]
      const publicId = `roda-mallorca/${filename}`

      // Eliminar las 3 versiones
      const baseId = filename.split('_')[0]
      const idsToDelete = [
        `roda-mallorca/${baseId}_original`,
        `roda-mallorca/${baseId}_medium`,
        `roda-mallorca/${baseId}_thumb`,
      ]

      await Promise.all(
        idsToDelete.map((id) =>
          cloudinary.uploader.destroy(id).catch(() => {})
        )
      )
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error)
    }
  }
}
