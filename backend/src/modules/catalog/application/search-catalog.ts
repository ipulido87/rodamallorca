export async function searchCatalog(params: {
  type: 'workshops' | 'products'
  q?: string
  city?: string
  categoryId?: string
  page?: number
  size?: number
}) {
  // Lógica unificada de búsqueda (opcional)
  // Por ahora los controladores ya tienen la lógica
}
