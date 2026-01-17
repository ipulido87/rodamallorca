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
    loadWorkshops(debouncedQuery, workshopFilters)
  }, [debouncedQuery, workshopFilters, loadWorkshops])

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
  }

  const handleToggleFavorite = async (workshopId: string) => {
    if (!user) return
    try {
      await toggleFavorite(workshopId, 'workshop')
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
          Error al cargar talleres: {workshopsError.message}
        </Alert>
      )
    if (workshops.length === 0)
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No se encontraron talleres con estos filtros.
        </Alert>
      )

    return (
      <ModernWorkshopLayout
        workshops={workshops}
        onToggleFavorite={handleToggleFavorite}
        favoriteIds={favoriteWorkshopIds}
        pagination={workshopsPagination}
        onPageChange={(page) =>
          loadWorkshops(debouncedQuery, workshopFilters, page)
        }
      />
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
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
          onClick={() => loadWorkshops(debouncedQuery, workshopFilters)}
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
