import { Search } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Container,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Seo } from '../../../shared/components/Seo'
import { useDebounce } from '../../../shared/hooks/use-debounce'
import { FilterBar } from '../../../shared/components/FilterBar'
import { productFilterConfig } from '../../../shared/constants/product-filters'
import { ProductSkeletonGrid } from '../../../shared/components/ProductSkeleton'
import { adaptProductImages } from '../../../utils/adapt-product-Images'
import { ModernProductLayout } from '../../products/components/modern-product-layout'
import { useCatalogSearch } from '../hooks/use-catalog-search'
import type { FilterValues, Product } from '../types/catalog'

// Adaptador para productos del catálogo
const adaptCatalogProductForLayout = (product: Product) => ({
  id: product.id,
  title: product.title,
  price: product.price,
  condition: 'used' as const,
  status: product.status,
  images: adaptProductImages(product.images),
  workshop: {
    name: product.workshop.name,
    city: product.workshop.city ?? undefined,
  },
})

export const Productos = () => {
  // Estado local
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilters, setProductFilters] = useState<FilterValues>({})

  // Hook personalizado
  const {
    products,
    productsLoading,
    productsError,
    productsPagination,
    loadProducts,
  } = useCatalogSearch()

  // Debounce para búsqueda
  const debouncedQuery = useDebounce(searchQuery, 500)

  // Cargar datos cuando cambien filtros o query con debounce
  useEffect(() => {
    loadProducts(debouncedQuery, productFilters)
  }, [debouncedQuery, productFilters, loadProducts])

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleProductFilterChange = (filterKey: string, value: any) => {
    setProductFilters((prev) => ({ ...prev, [filterKey]: value }))
  }

  const clearProductFilters = () => {
    setProductFilters({})
    setSearchQuery('')
  }

  const renderProductsContent = () => {
    if (productsLoading) return <ProductSkeletonGrid count={6} />
    if (productsError)
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar recambios: {productsError}
        </Alert>
      )
    if (products.length === 0)
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No se encontraron recambios con estos filtros.
        </Alert>
      )

    const adaptedProducts = products.map(adaptCatalogProductForLayout)
    return (
      <>
        <ModernProductLayout
          products={adaptedProducts}
          loading={false}
          emptyMessage="No se encontraron recambios"
          onFavoriteToggle={() => {}}
          favoriteIds={[]}
        />

        {productsPagination.total > 0 && (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {products.length} de {productsPagination.total} recambios
            </Typography>
          </Box>
        )}
      </>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Seo
        title="Recambios y Componentes de Bicicleta en Mallorca | RodaMallorca"
        description="Compra recambios, componentes y accesorios para tu bicicleta en Mallorca. Piezas de talleres verificados con envío y recogida en Mallorca."
        canonicalPath="/productos"
        keywords="recambios bicicleta Mallorca, componentes ciclismo Mallorca, piezas bicicleta Palma, accesorios bici Mallorca"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://rodamallorca.es/' },
              { '@type': 'ListItem', position: 2, name: 'Productos', item: 'https://rodamallorca.es/productos' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Recambios y Componentes de Bicicleta en Mallorca',
            description: 'Compra recambios, componentes y accesorios para tu bicicleta en Mallorca. Piezas de talleres verificados con envío y recogida en Mallorca.',
            url: 'https://rodamallorca.es/productos',
          },
        ]}
      />
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #3949ab, #5c6bc0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Recambios y Componentes
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Encuentra piezas, componentes y accesorios para tu bicicleta
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, maxWidth: 600, mx: 'auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar recambios, marcas, componentes..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
        <Button
          variant="contained"
          onClick={() => loadProducts(debouncedQuery, productFilters)}
          sx={{ minWidth: 120 }}
        >
          Buscar
        </Button>
      </Box>

      {/* Filters */}
      <FilterBar
        filters={productFilterConfig}
        values={productFilters}
        onChange={handleProductFilterChange}
        onClear={clearProductFilters}
      />

      {/* Content */}
      {renderProductsContent()}
    </Container>
  )
}
