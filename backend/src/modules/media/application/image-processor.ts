import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export interface ProcessedImage {
  original: string
  medium: string
  thumbnail: string
}

export class ImageProcessor {
  private uploadsDir = path.join(process.cwd(), 'uploads')

  constructor() {
    this.ensureUploadsDir()
  }

  private async ensureUploadsDir() {
    try {
      await fs.access(this.uploadsDir)
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true })
    }
  }

  async processImage(
    buffer: Buffer,
    originalName: string
  ): Promise<ProcessedImage> {
    const fileId = uuidv4()
    const ext = 'webp'

    const paths = {
      original: `${fileId}_original.${ext}`,
      medium: `${fileId}_medium.${ext}`,
      thumbnail: `${fileId}_thumb.${ext}`,
    }

    await Promise.all([
      sharp(buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(path.join(this.uploadsDir, paths.original)),

      sharp(buffer)
        .resize(600, 600, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(path.join(this.uploadsDir, paths.medium)),

      sharp(buffer)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(path.join(this.uploadsDir, paths.thumbnail)),
    ])

    return {
      original: `/uploads/${paths.original}`,
      medium: `/uploads/${paths.medium}`,
      thumbnail: `/uploads/${paths.thumbnail}`,
    }
  }

  async deleteImage(imagePath: string): Promise<void> {
    try {
      const filename = path.basename(imagePath)
      const fileId = filename.split('_')[0]

      const filesToDelete = [
        `${fileId}_original.webp`,
        `${fileId}_medium.webp`,
        `${fileId}_thumb.webp`,
      ]

      await Promise.all(
        filesToDelete.map((file) =>
          fs.unlink(path.join(this.uploadsDir, file)).catch(() => {})
        )
      )
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }
}
