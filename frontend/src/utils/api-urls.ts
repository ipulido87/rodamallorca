export const getImageUrl = (imagePath: string): string => {
  const baseUrl = 'http://localhost:4000' 
  return `${baseUrl}${imagePath}`
}
