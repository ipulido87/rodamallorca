import { API } from '@/shared/api'

export interface ProcessedImage {
  original: string
  medium: string
  thumbnail: string
}

export interface UploadResponse {
  message: string
  image: ProcessedImage
}

export interface UploadMultipleResponse {
  message: string
  images: ProcessedImage[]
}

export const uploadSingleImage = async (
  file: File
): Promise<ProcessedImage> => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await API.post<UploadResponse>(
    '/media/upload/single',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data.image
}

export const uploadMultipleImages = async (
  files: File[]
): Promise<ProcessedImage[]> => {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append('images', file)
  })

  const response = await API.post<UploadMultipleResponse>(
    '/media/upload/multiple',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return response.data.images
}

export const deleteImage = async (imagePath: string): Promise<void> => {
  await API.delete('/media/delete', {
    data: { imagePath },
  })
}
