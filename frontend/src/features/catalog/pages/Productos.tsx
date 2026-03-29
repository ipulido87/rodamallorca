import {
  Alert,
  Box,
  Container,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Seo } from '../../../shared/components/Seo'
import { FilterBar } from '../../../shared/components/FilterBar'
import { ProductSkeletonGrid } from '../../../shared/components/ProductSkeleton'
import { useSmartSearch } from '../../../shared/search'
import { productFilterConfig } from '../../../shared/constants/product-filters'
import { adaptProductImages } from '../../../utils/adapt-product-Images'
import { ModernProductLayout } from '../../products/components/modern-product-layout'
import { useCatalogSearch } from '../hooks/use-catalog-search'
import { SmartSearchBar } from '../components'
import type { FilterValues, PublicProduct } from '../types/catalog'

// Configuración de búsqueda fuzzy para productos
const PRODUCT_SEARCH_KEYS = [
  { name: 'title' as const, weight: 0.6 },
  { name: 'description' as const, weight: 0.2 },
]

const adaptCatalogProductForLayout = (product: PublicProduct) => ({
  id: product.id,
  title: product.title,
  price: product.price,
  condition: product.condition ?? ('used' as const),
  status: product.status,
  images: adaptProductImages(product.images),
  workshop: {
    name: product.workshop.name,
    city: product.workshop.city ?? undefined,
  },
})

export const Productos = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [productFilters, setProductFilters] = useState<FilterValues>({})

  const {
    products,
    productsLoading,
    productsError,
    productsPagination,
    loadProducts,
  } = useCatalogSearch()

  // Búsqueda inteligente client-side sobre los productos ya cargados
  const { results: smartResults, rawQuery, parsedQuery, isFiltered, setQuery } =
    useSmartSearch<PublicProduct>(products as PublicProduct[], { keys: PRODUCT_SEARCH_KEYS })

  // Aplicar filtros del parser NLP que no se pueden resolver server-side
  const filteredProducts = useMemo(() => {
    let base = isFiltered ? smartResults : (products as PublicProduct[])

    if (parsedQuery.city && !productFilters.city) {
      base = base.filter(
        (p) => p.workshop?.city?.toLowerCase() === parsedQuery.city.toLowerCase()
      )
    }

    if (parsedQuery.condition && !productFilters.condition) {
      base = base.filter((p) => p.condition === parsedQuery.condition)
    }

    if (parsedQuery.maxPrice) {
      base = base.filter((p) => p.price <= parsedQuery.maxPrice)
    }
    if (parsedQuery.minPrice) {
      base = base.filter((p) => p.price >= parsedQuery.minPrice)
    }

    if (parsedQuery.sort === 'price_asc') {
      base = [...base].sort((a, b) => a.price - b.price)
    } else if (parsedQuery.sort === 'price_desc') {
      base = [...base].sort((a, b) => b.price - a.price)
    } else if (parsedQuery.sort === 'newest') {
      base = [...base].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }

    return base
  }, [smartResults, products, isFiltered, parsedQuery, productFilters])

  // Carga inicial + aplicar query proveniente de la landing page (?q=...)
  useEffect(() => {
    const urlQ = searchParams.get('q')
    if (urlQ) {
      setQuery(urlQ)
      const params = new URLSearchParams(searchParams)
      params.delete('q')
      setSearchParams(params, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Carga inicial y cambios de filtros
  useEffect(() => {
    loadProducts('', productFilters)
  }, [productFilters]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleProductFilterChange = (filterKey: string, value: FilterValues[string]) => {
    setProductFilters((prev) => ({ ...prev, [filterKey]: value }))
  }

  const clearFilters = () => {
    setProductFilters({})
    setQuery('')
  }

  const renderContent = () => {
    if (productsLoading) return <ProductSkeletonGrid count={6} />

    if (productsError)
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {t('catalog.products.loadError')}{productsError}
        </Alert>
      )

    if (filteredProducts.length === 0)
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('catalog.products.noResultsFilter')}
        </Alert>
      )

    const adapted = filteredProducts.map(adaptCatalogProductForLayout)

    return (
      <>
        <ModernProductLayout
          products={adapted}
          loading={false}
          emptyMessage={t('catalog.products.noResults')}
          onFavoriteToggle={() => {}}
          favoriteIds={[]}
        />

        {productsPagination.total > 0 && (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t('common.showing')} {filteredProducts.length} {t('common.of')} {productsPagination.total} {t('catalog.products.count')}
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
        description={t('catalog.products.subtitle')}
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
            description: 'Compra recambios, componentes y accesorios para tu bicicleta en Mallorca.',
            url: 'https://rodamallorca.es/productos',
          },
        ]}
      />

      {/* Hero */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700, color: 'text.primary' }}
        >
          {t('catalog.products.directoryTitle')}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          {t('catalog.products.directorySubtitle')}
        </Typography>
      </Box>

      {/* Búsqueda inteligente */}
      <Box sx={{ mb: 3 }}>
        <SmartSearchBar
          value={rawQuery}
          onChange={setQuery}
          placeholder={t('catalog.products.searchPlaceholder')}
          parsedQuery={parsedQuery}
        />
      </Box>

      {/* Filtros */}
      <FilterBar
        filters={productFilterConfig}
        values={productFilters}
        onChange={handleProductFilterChange}
        onClear={clearFilters}
      />

      {/* Contenido */}
      {renderContent()}
    </Container>
  )
}
