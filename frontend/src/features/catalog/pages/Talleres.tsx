import { Search } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Container,
  Pagination,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Seo } from '../../../shared/components/Seo'
import { useDebounce } from '../../../shared/hooks/use-debounce'
import { FilterBar } from '../../../shared/components/FilterBar'
import {
  getUserFavorites,
  toggleFavorite,
} from '../../favorites/services/favorite-service'
import { workshopFilterConfig } from '../../../shared/constants/product-filters'
import { WorkshopSkeletonGrid } from '../../../shared/components/WorkshopSkeleton'
import { useAuth } from '../../auth/hooks/useAuth'
import { ModernWorkshopLayout } from '../../products/components/modern-product-layout'
import { useCatalogSearch } from '../hooks/use-catalog-search'
import type { FilterValues } from '../types/catalog'

export const Talleres = () => {
  const { user } = useAuth()

  // Estado local
  const [searchQuery, setSearchQuery] = useState('')
  const [workshopFilters, setWorkshopFilters] = useState<FilterValues>({})
  const [favoriteWorkshopIds, setFavoriteWorkshopIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // Hook personalizado
  const {
    workshops,
    workshopsLoading,
    workshopsError,
    workshopsPagination,
    loadWorkshops,
  } = useCatalogSearch()

  // Debounce para búsqueda
  const debouncedQuery = useDebounce(searchQuery, 500)

  // Cargar datos cuando cambien filtros o query con debounce
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedQuery, workshopFilters])

  useEffect(() => {
    loadWorkshops(debouncedQuery, workshopFilters, currentPage)
  }, [currentPage, debouncedQuery, workshopFilters, loadWorkshops])

  // Cargar favoritos si el usuario está autenticado
  useEffect(() => {
    if (user) {
      getUserFavorites()
        .then((favs) => {
          const workshopIds = favs
            .filter((f) => f.workshopId)
            .map((f) => f.workshopId!)
          setFavoriteWorkshopIds(workshopIds)
        })
        .catch((err) => console.error('Error loading favorites:', err))
    }
  }, [user])

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleWorkshopFilterChange = (filterKey: string, value: any) => {
    setWorkshopFilters((prev) => ({ ...prev, [filterKey]: value }))
  }

  const clearWorkshopFilters = () => {
    setWorkshopFilters({})
    setSearchQuery('')
    setCurrentPage(1)
  }

  const handleToggleFavorite = async (workshopId: string) => {
    if (!user) return
    try {
      await toggleFavorite(workshopId)
      setFavoriteWorkshopIds((prev) =>
        prev.includes(workshopId)
          ? prev.filter((id) => id !== workshopId)
          : [...prev, workshopId]
      )
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const renderWorkshopsContent = () => {
    if (workshopsLoading) return <WorkshopSkeletonGrid count={6} />
    if (workshopsError)
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error al cargar talleres: {workshopsError}
        </Alert>
      )
    if (workshops.length === 0)
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No se encontraron talleres con estos filtros.
        </Alert>
      )

    return (
      <>
        <ModernWorkshopLayout
          workshops={workshops}
          loading={false}
          emptyMessage="No se encontraron talleres"
          onFavoriteToggle={handleToggleFavorite}
          favoriteIds={favoriteWorkshopIds}
        />

        {workshopsPagination.total > 0 && (
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {(workshopsPagination.page - 1) * workshopsPagination.size + 1}
              -{Math.min(workshopsPagination.page * workshopsPagination.size, workshopsPagination.total)}
              {' '}de {workshopsPagination.total} talleres
            </Typography>

            <Pagination
              color="primary"
              count={Math.ceil(workshopsPagination.total / workshopsPagination.size)}
              page={workshopsPagination.page}
              onChange={(_, page) => setCurrentPage(page)}
            />
          </Box>
        )}
      </>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Seo
        title="Talleres de Bicicletas en Mallorca | RodaMallorca"
        description="Encuentra talleres de bicicletas verificados en Mallorca. Reparación, mantenimiento y servicios de ciclismo. Reserva cita online con los mejores mecánicos de Palma y toda la isla."
        canonicalPath="/talleres"
        keywords="talleres bicicletas Mallorca, reparación bicicleta Mallorca, mecánico bicicletas Palma, taller ciclismo Mallorca"
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://rodamallorca.es/' },
              { '@type': 'ListItem', position: 2, name: 'Talleres', item: 'https://rodamallorca.es/talleres' },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Talleres de Bicicletas en Mallorca',
            description: 'Encuentra talleres de bicicletas verificados en Mallorca. Reparación, mantenimiento y servicios de ciclismo.',
            url: 'https://rodamallorca.es/talleres',
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
          Directorio de Talleres
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Encuentra talleres de confianza en Mallorca
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, maxWidth: 600, mx: 'auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar talleres por nombre o ciudad..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            setCurrentPage(1)
            loadWorkshops(debouncedQuery, workshopFilters, 1)
          }}
          sx={{ minWidth: 120 }}
        >
          Buscar
        </Button>
      </Box>

      {/* Filters */}
      <FilterBar
        filters={workshopFilterConfig}
        values={workshopFilters}
        onChange={handleWorkshopFilterChange}
        onClear={clearWorkshopFilters}
      />

      {/* Content */}
      {renderWorkshopsContent()}
    </Container>
  )
}
