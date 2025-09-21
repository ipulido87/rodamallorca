// pages/catalog.tsx

import { Search } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilterBar } from '../components/common/filter-bar'
import {
  productFilterConfig,
  workshopFilterConfig,
} from '../config/product-filters'
import { useAuth } from '../hooks/use-auth'
import { searchProducts, searchWorkshops } from '../services/catalog-service'
import type {
  FilterValue,
  FilterValues,
  PaginatedResponse,
  Product,
  ProductSearchParams,
  Workshop,
  WorkshopSearchParams,
} from '../types/catalog'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </Box>
  )
}

export const Catalog = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // Filtros
  const [productFilters, setProductFilters] = useState<FilterValues>({})
  const [workshopFilters, setWorkshopFilters] = useState<FilterValues>({})

  // Estados para workshops
  const [workshopsData, setWorkshopsData] =
    useState<PaginatedResponse<Workshop> | null>(null)
  const [workshopsLoading, setWorkshopsLoading] = useState(false)
  const [workshopsError, setWorkshopsError] = useState<string | null>(null)

  // Estados para products
  const [productsData, setProductsData] =
    useState<PaginatedResponse<Product> | null>(null)
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)

  const isWorkshopOwner = user?.role === 'WORKSHOP_OWNER'

  // Configuración según el rol del usuario
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

  // Cargar workshops con filtros
  const loadWorkshops = useCallback(
    async (search?: string, filters?: FilterValues) => {
      setWorkshopsLoading(true)
      setWorkshopsError(null)
      try {
        const params: WorkshopSearchParams = {
          size: 12,
          page: 1,
        }

        if (search) params.q = search
        if (filters?.city && typeof filters.city === 'string') {
          params.city = filters.city
        }

        const response = await searchWorkshops(params)
        setWorkshopsData(response)
      } catch (error) {
        setWorkshopsError('Error al cargar los talleres')
        console.error('Error loading workshops:', error)
      } finally {
        setWorkshopsLoading(false)
      }
    },
    []
  )

  // Cargar products con filtros
  const loadProducts = useCallback(
    async (search?: string, filters?: FilterValues) => {
      setProductsLoading(true)
      setProductsError(null)
      try {
        const params: ProductSearchParams = {
          size: 12,
          page: 1,
        }

        if (search) params.q = search
        if (filters?.city && typeof filters.city === 'string') {
          params.city = filters.city
        }
        if (filters?.condition && typeof filters.condition === 'string') {
          params.condition = filters.condition
        }

        // Manejar rango de precio
        if (filters?.price && Array.isArray(filters.price)) {
          params.minPrice = filters.price[0]
          params.maxPrice = filters.price[1]
        }

        const response = await searchProducts(params)
        setProductsData(response)
      } catch (error) {
        setProductsError('Error al cargar los productos')
        console.error('Error loading products:', error)
      } finally {
        setProductsLoading(false)
      }
    },
    []
  )

  // Cargar datos iniciales
  useEffect(() => {
    loadWorkshops('', workshopFilters)
    loadProducts('', productFilters)
  }, [productFilters, workshopFilters, loadWorkshops, loadProducts])

  // Recargar cuando cambien los filtros
  useEffect(() => {
    const currentTab = tabValue
    if (currentTab === 0) {
      loadWorkshops(searchQuery, workshopFilters)
    }
  }, [workshopFilters, searchQuery, tabValue, loadWorkshops])

  useEffect(() => {
    const currentTab = tabValue
    if (currentTab === 1) {
      loadProducts(searchQuery, productFilters)
    }
  }, [productFilters, searchQuery, tabValue, loadProducts])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleSearch = () => {
    const currentTab = tabValue
    if (currentTab === 0) {
      loadWorkshops(searchQuery || undefined, workshopFilters)
    } else if (currentTab === 1) {
      loadProducts(searchQuery || undefined, productFilters)
    }
  }

  const handleProductFilterChange = (key: string, value: FilterValue) => {
    setProductFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleWorkshopFilterChange = (key: string, value: FilterValue) => {
    setWorkshopFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearProductFilters = () => {
    setProductFilters({})
  }

  const clearWorkshopFilters = () => {
    setWorkshopFilters({})
  }

  const renderWorkshopsContent = () => (
    <Box>
      {workshopsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {workshopsError}
        </Alert>
      )}

      {workshopsLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {workshopsData?.items.map((workshop: Workshop) => (
            <Card key={workshop.id} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {workshop.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {workshop.description || 'Sin descripción disponible'}
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {workshop.address && (
                    <Typography variant="caption" color="text.secondary">
                      📍 {workshop.address}
                    </Typography>
                  )}
                  {workshop.city && workshop.country && (
                    <Typography variant="caption" color="text.secondary">
                      🌍 {workshop.city}, {workshop.country}
                    </Typography>
                  )}
                  {workshop.phone && (
                    <Typography variant="caption" color="text.secondary">
                      📞 {workshop.phone}
                    </Typography>
                  )}
                  <Typography variant="caption" color="info.main">
                    ⏰ Miembro desde{' '}
                    {new Date(workshop.createdAt).getFullYear()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {!workshopsLoading &&
        workshopsData &&
        workshopsData.items.length === 0 && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron talleres
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Intenta con otros términos de búsqueda
            </Typography>
          </Box>
        )}

      {workshopsData && workshopsData.total > 0 && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {workshopsData.items.length} de {workshopsData.total}{' '}
            talleres
          </Typography>
        </Box>
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
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {productsData?.items.map((product: Product) => (
            <Card
              key={product.id}
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                },
              }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {product.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {product.description || 'Sin descripción disponible'}
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    €{product.price}
                  </Typography>
                  {product.category && (
                    <Chip
                      label={product.category.name}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    🏪 {product.workshop.name}
                  </Typography>
                  {product.workshop.city && (
                    <Typography variant="caption" color="text.secondary">
                      📍 {product.workshop.city}
                    </Typography>
                  )}
                  <Typography variant="caption" color="success.main">
                    ✅{' '}
                    {product.status === 'PUBLISHED'
                      ? 'Disponible'
                      : 'No disponible'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {!productsLoading && productsData && productsData.items.length === 0 && (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No se encontraron productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intenta con otros términos de búsqueda
          </Typography>
        </Box>
      )}

      {productsData && productsData.total > 0 && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {productsData.items.length} de {productsData.total}{' '}
            productos
          </Typography>
        </Box>
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
        Esta sección mostrará análisis de productos más vendidos y tendencias de
        mercado
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
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
        />
        <Button
          variant="contained"
          size="large"
          sx={{ minWidth: 120 }}
          onClick={handleSearch}
        >
          {config.searchButtonText}
        </Button>
      </Box>

      {/* Filtros */}
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
