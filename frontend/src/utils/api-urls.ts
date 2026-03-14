export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return ''
  // Already absolute (http/https/data/blob)
  if (/^(https?:)?\/\//.test(imagePath) || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
    return imagePath
  }
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/api$/, '')
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${baseUrl}${normalizedPath}`
}
