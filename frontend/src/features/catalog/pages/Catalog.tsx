import { Search } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Container,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useDebounce } from '../../../features/../shared/hooks/use-debounce'
import { FilterBar } from '../../../shared/components/FilterBar'
import {
  getUserFavorites,
  toggleFavorite,
} from '../../favorites/services/favorite-service'
import {
  productFilterConfig,
  workshopFilterConfig,
} from '../../../shared/constants/product-filters'
import { ProductSkeletonGrid } from '../../../shared/components/ProductSkeleton'
import { WorkshopSkeletonGrid } from '../../../shared/components/WorkshopSkeleton'
import { adaptProductImages } from '../../../utils/adapt-product-Images'
import { useAuth } from '../../auth/hooks/useAuth'
import {
  ModernProductLayout,
  ModernWorkshopLayout,
} from '../../products/components/modern-product-layout'
import { useCatalogSearch } from '../hooks/use-catalog-search'
import type { FilterValue, FilterValues, Product } from '../types/catalog'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <Box
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </Box>
)

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

export const Catalog = () => {
  const { user } = useAuth()
  const isWorkshopOwner = user?.role === 'WORKSHOP_OWNER'

  // Estado local
  const [tabValue, setTabValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [productFilters, setProductFilters] = useState<FilterValues>({})
  const [workshopFilters, setWorkshopFilters] = useState<FilterValues>({})
  const [favoriteWorkshopIds, setFavoriteWorkshopIds] = useState<string[]>([])

  // Hook personalizado
  const {
    products,
    productsLoading,
    productsError,
    productsPagination,
    loadProducts,
    workshops,
    workshopsLoading,
    workshopsError,
    workshopsPagination,
    loadWorkshops,
  } = useCatalogSearch()

  // Debounce para búsqueda
  const debouncedQuery = useDebounce(searchQuery, 500)

  // Configuración según rol
  const config = isWorkshopOwner
    ? {
        title: 'Análisis de Mercado',
        subtitle: 'Conoce tu competencia y las tendencias del sector',
        searchPlaceholder: 'Buscar competidores, productos populares...',
        tabs: ['Competencia', 'Productos Populares', 'Tendencias'],
        searchButtonText: 'Analizar',
      }
    : {
        title: 'RodaMallorca Marketplace',
        subtitle: 'Encuentra talleres de confianza y productos para tu bici',
        searchPlaceholder: 'Buscar talleres, productos, servicios...',
        tabs: ['Talleres', 'Productos'],
        searchButtonText: 'Buscar',
      }

  // Cargar datos cuando cambien filtros o query con debounce
  useEffect(() => {
    if (tabValue === 0) {
      loadWorkshops(debouncedQuery, workshopFilters)
    }
  }, [debouncedQuery, workshopFilters, tabValue, loadWorkshops])

  useEffect(() => {
    if (tabValue === 1) {
      loadProducts(debouncedQuery, productFilters)
    }
  }, [debouncedQuery, productFilters, tabValue, loadProducts])

  // Carga inicial
  useEffect(() => {
    loadWorkshops()
    loadProducts()
  }, [loadProducts, loadWorkshops])

  // Cargar favoritos del usuario
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const favorites = await getUserFavorites()
          setFavoriteWorkshopIds(favorites.map((f) => f.workshopId))
        } catch (error) {
          console.error('Error loading favorites:', error)
        }
      }
    }
    loadFavorites()
  }, [user])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleProductFilterChange = (key: string, value: FilterValue) => {
    setProductFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleWorkshopFilterChange = (key: string, value: FilterValue) => {
    setWorkshopFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearProductFilters = () => setProductFilters({})
  const clearWorkshopFilters = () => setWorkshopFilters({})

  const handleProductFavoriteToggle = (productId: string) => {
    console.log('Toggle product favorite:', productId)
    // TODO: Implementar lógica de favoritos para productos
  }

  const handleWorkshopFavoriteToggle = async (workshopId: string) => {
    try {
      const result = await toggleFavorite(workshopId)
      if (result.added) {
        setFavoriteWorkshopIds((prev) => [...prev, workshopId])
      } else {
        setFavoriteWorkshopIds((prev) => prev.filter((id) => id !== workshopId))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const renderWorkshopsContent = () => (
    <Box>
      {workshopsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {workshopsError}
        </Alert>
      )}

      {workshopsLoading ? (
        <WorkshopSkeletonGrid count={6} />
      ) : (
        <>
          <ModernWorkshopLayout
            workshops={workshops}
            loading={false}
            emptyMessage="No se encontraron talleres"
            onFavoriteToggle={handleWorkshopFavoriteToggle}
            favoriteIds={favoriteWorkshopIds}
          />

          {workshopsPagination.total > 0 && (
            <Box textAlign="center" sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {workshops.length} de {workshopsPagination.total} talleres
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  )

  const renderProductsContent = () => (
    <Box>
      {productsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {productsError}
        </Alert>
      )}

      {productsLoading ? (
        <ProductSkeletonGrid count={8} />
      ) : (
        <>
          <ModernProductLayout
            products={products.map(adaptCatalogProductForLayout)}
            loading={false}
            error={productsError ?? undefined}
            emptyMessage="No se encontraron productos"
            onFavoriteToggle={handleProductFavoriteToggle}
            favoriteIds={[]}
          />

          {productsPagination.total > 0 && (
            <Box textAlign="center" sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {products.length} de {productsPagination.total} productos
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  )

  const renderCompetitionContent = () => (
    <Box>
      <Typography variant="h6" gutterBottom color="warning.dark">
        Análisis de Competencia
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Talleres similares en tu área de operación
      </Typography>
      {renderWorkshopsContent()}
    </Box>
  )

  const renderTrendsContent = () => (
    <Box textAlign="center" py={8}>
      <Typography variant="h6" color="text.secondary">
        Tendencias del mercado ciclista
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Esta sección mostrará análisis de productos más vendidos y tendencias
      </Typography>
    </Box>
  )

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {config.title}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {config.subtitle}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          centered
          variant={config.tabs.length > 2 ? 'scrollable' : 'standard'}
        >
          {config.tabs.map((tab, index) => (
            <Tab key={index} label={tab} />
          ))}
        </Tabs>
      </Box>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, maxWidth: 600, mx: 'auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={config.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
        />
        <Button
          variant="contained"
          size="large"
          sx={{ minWidth: 120 }}
          disabled={productsLoading || workshopsLoading}
        >
          {config.searchButtonText}
        </Button>
      </Box>

      {/* Contenido según tab */}
      {!isWorkshopOwner && (
        <>
          <TabPanel value={tabValue} index={0}>
            <FilterBar
              filters={workshopFilterConfig}
              values={workshopFilters}
              onChange={handleWorkshopFilterChange}
              onClear={clearWorkshopFilters}
            />
            {renderWorkshopsContent()}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <FilterBar
              filters={productFilterConfig}
              values={productFilters}
              onChange={handleProductFilterChange}
              onClear={clearProductFilters}
            />
            {renderProductsContent()}
          </TabPanel>
        </>
      )}

      {isWorkshopOwner && (
        <>
          <TabPanel value={tabValue} index={0}>
            <FilterBar
              filters={workshopFilterConfig}
              values={workshopFilters}
              onChange={handleWorkshopFilterChange}
              onClear={clearWorkshopFilters}
            />
            {renderCompetitionContent()}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <FilterBar
              filters={productFilterConfig}
              values={productFilters}
              onChange={handleProductFilterChange}
              onClear={clearProductFilters}
            />
            {renderProductsContent()}
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            {renderTrendsContent()}
          </TabPanel>
        </>
      )}
    </Container>
  )
}
