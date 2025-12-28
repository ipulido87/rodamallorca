export const getImageUrl = (imagePath: string): string => {
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'
  return `${baseUrl}${imagePath}`
}
