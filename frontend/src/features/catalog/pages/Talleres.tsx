import {
  Alert,
  Box,
  Container,
  Pagination,
  Typography,
} from '@mui/material'
import { AutoAwesome } from '@mui/icons-material'
import { Chip } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Seo } from '../../../shared/components/Seo'
import { FilterBar } from '../../../shared/components/FilterBar'
import { WorkshopSkeletonGrid } from '../../../shared/components/WorkshopSkeleton'
import { useSmartSearch } from '../../../shared/search'
import {
  getUserFavorites,
  toggleFavorite,
} from '../../favorites/services/favorite-service'
import { workshopFilterConfig } from '../../../shared/constants/product-filters'
import { useAuth } from '../../auth/hooks/useAuth'
import { ModernWorkshopLayout } from '../../products/components/modern-product-layout'
import { useCatalogSearch } from '../hooks/use-catalog-search'
import { WorkshopMap, SmartSearchBar, MapViewToggle } from '../components'
import type { CatalogView } from '../components'
import type { FilterValues, Workshop } from '../types/catalog'

// Configuración de búsqueda fuzzy para talleres
const WORKSHOP_SEARCH_KEYS = [
  { name: 'name' as const, weight: 0.6 },
  { name: 'city' as const, weight: 0.3 },
  { name: 'description' as const, weight: 0.1 },
]

interface AiLocationState {
  aiResults?: Workshop[]
  aiMessage?: string
  aiTotal?: number
  aiQuery?: string
}

export const Talleres = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const aiState = (location.state as AiLocationState) ?? {}

  // Vista: grid o mapa (persistida en la URL para que sea compartible)
  const [view, setView] = useState<CatalogView>(
    searchParams.get('view') === 'map' ? 'map' : 'grid'
  )

  const [workshopFilters, setWorkshopFilters] = useState<FilterValues>({})
  const [favoriteWorkshopIds, setFavoriteWorkshopIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  // AI results from hero search (populated via router state)
  const [aiWorkshops, setAiWorkshops] = useState<Workshop[] | null>(
    aiState.aiResults && aiState.aiResults.length > 0 ? aiState.aiResults : null
  )
  const [aiMessage, setAiMessage] = useState<string | null>(aiState.aiMessage ?? null)

  const {
    workshops,
    workshopsLoading,
    workshopsError,
    workshopsPagination,
    loadWorkshops,
  } = useCatalogSearch()

  // Búsqueda inteligente client-side sobre los workshops ya cargados
  const { results: smartResults, rawQuery, parsedQuery, isFiltered, setQuery } =
    useSmartSearch<Workshop>(workshops, { keys: WORKSHOP_SEARCH_KEYS })

  // Aplicar filtro de ciudad extraído del NLP si no hay filtro manual
  const filteredWorkshops = useMemo(() => {
    // Si hay resultados de IA y no hay filtros manuales activos, usarlos directamente
    if (aiWorkshops && !isFiltered && !workshopFilters.city) {
      return aiWorkshops
    }

    const base = isFiltered ? smartResults : workshops

    if (parsedQuery.city && !workshopFilters.city) {
      return base.filter(
        (w) => w.city?.toLowerCase() === parsedQuery.city.toLowerCase()
      )
    }
    return base
  }, [aiWorkshops, smartResults, workshops, isFiltered, parsedQuery.city, workshopFilters.city])

  const handleViewChange = (next: CatalogView) => {
    setView(next)
    const params = new URLSearchParams(searchParams)
    params.set('view', next)
    setSearchParams(params, { replace: true })
  }

  // Carga inicial + aplicar query proveniente de la landing page (?q=...)
  useEffect(() => {
    loadWorkshops('', {}, 1, view === 'map' ? 50 : 12)
    const urlQ = searchParams.get('q')
    if (urlQ) {
      setQuery(urlQ)
      const params = new URLSearchParams(searchParams)
      params.delete('q')
      setSearchParams(params, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reload al cambiar filtros manuales (solo en grid, en mapa usamos client-side)
  useEffect(() => {
    if (view === 'grid') {
      setCurrentPage(1)
      loadWorkshops('', workshopFilters, 1)
    }
  }, [workshopFilters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (view === 'grid') {
      loadWorkshops('', workshopFilters, currentPage)
    }
  }, [currentPage]) // eslint-disable-line react-hooks/exhaustive-deps

  // Al cambiar a mapa, cargar todos sin paginación (tamaño grande)
  useEffect(() => {
    if (view === 'map') {
      loadWorkshops('', workshopFilters, 1, 50)
    }
  }, [view]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      getUserFavorites()
        .then((favs) => {
          const ids = favs.filter((f) => f.workshopId).map((f) => f.workshopId!)
          setFavoriteWorkshopIds(ids)
        })
        .catch((err) => console.error('Error loading favorites:', err))
    }
  }, [user])

  const handleWorkshopFilterChange = (filterKey: string, value: FilterValues[string]) => {
    setWorkshopFilters((prev) => ({ ...prev, [filterKey]: value }))
  }

  const clearFilters = () => {
    setWorkshopFilters({})
    setQuery('')
    setCurrentPage(1)
    setAiWorkshops(null)
    setAiMessage(null)
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

  const renderContent = () => {
    if (workshopsLoading) return <WorkshopSkeletonGrid count={6} />

    if (workshopsError)
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          {t('catalog.workshops.loadError')}{workshopsError}
        </Alert>
      )

    if (view === 'map') {
      return <WorkshopMap workshops={filteredWorkshops} height={520} />
    }

    if (filteredWorkshops.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('catalog.workshops.noResultsFilter')}
        </Alert>
      )
    }

    return (
      <>
        <ModernWorkshopLayout
          workshops={filteredWorkshops}
          loading={false}
          emptyMessage={t('catalog.workshops.noResults')}
          onFavoriteToggle={handleToggleFavorite}
          favoriteIds={favoriteWorkshopIds}
        />

        {workshopsPagination.total > 0 && !isFiltered && (
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Mostrando{' '}
              {(workshopsPagination.page - 1) * workshopsPagination.size + 1}–
              {Math.min(
                workshopsPagination.page * workshopsPagination.size,
                workshopsPagination.total
              )}{' '}
              de {workshopsPagination.total} talleres
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
            description: 'Encuentra talleres de bicicletas verificados en Mallorca.',
            url: 'https://rodamallorca.es/talleres',
          },
        ]}
      />

      {/* Hero */}
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
          {t('catalog.workshops.directoryTitle')}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          {t('catalog.workshops.directorySubtitle')}
        </Typography>
      </Box>

      {/* Search + Toggle de vista */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <SmartSearchBar
            value={rawQuery}
            onChange={setQuery}
            placeholder='Busca por nombre, ciudad o describe lo que necesitas...'
            parsedQuery={parsedQuery}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', pt: { xs: 0, sm: 0.5 } }}>
          <MapViewToggle value={view} onChange={handleViewChange} />
        </Box>
      </Box>

      {/* Filtros */}
      <FilterBar
        filters={workshopFilterConfig}
        values={workshopFilters}
        onChange={handleWorkshopFilterChange}
        onClear={clearFilters}
      />

      {/* Banner de resultado de IA */}
      {aiMessage && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<AutoAwesome sx={{ fontSize: '16px !important' }} />}
            label={aiMessage}
            color="primary"
            variant="outlined"
            onDelete={() => { setAiMessage(null); setAiWorkshops(null) }}
            sx={{ height: 'auto', py: 0.5, '& .MuiChip-label': { whiteSpace: 'normal' } }}
          />
        </Box>
      )}

      {/* Contenido: grid o mapa */}
      {renderContent()}
    </Container>
  )
}
