interface RawImage {
  id: string
  url: string
  productId?: string
  position?: number
}

interface ProductImage {
  id: string
  original: string
  medium: string
  thumbnail: string
  position: number
}

export type AnyImage = RawImage | ProductImage

export const adaptProductImages = (images: AnyImage[] = []): ProductImage[] => {
  // quita /api si lo tienes en el .env
  const baseUrl = (
    import.meta.env.VITE_API_URL || 'http://localhost:4000'
  ).replace(/\/api$/, '')

  return images.map((img, index) => {
    if ('original' in img) {
      console.log('Adapting image:', img, ' → baseUrl:', baseUrl)

      return {
        ...img,
        original: img.original.startsWith('http')
          ? img.original
          : `${baseUrl}${img.original}`,
        medium: img.medium.startsWith('http')
          ? img.medium
          : `${baseUrl}${img.medium}`,
        thumbnail: img.thumbnail.startsWith('http')
          ? img.thumbnail
          : `${baseUrl}${img.thumbnail}`,
      }
    }

    return {
      id: img.id,
      original: img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`,
      medium: img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`,
      thumbnail: img.url.startsWith('http') ? img.url : `${baseUrl}${img.url}`,
      position: index,
    }
  })
}
