import { LocationOn, Phone, Star } from '@mui/icons-material'
import { Box, Button, CircularProgress, Link, Skeleton, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LeafletMap } from '../../../shared/components/LeafletMap'
import type { MapMarkerConfig } from '../../../shared/components/LeafletMap'
import { geocodeAddress } from '../../../shared/services/geocoding-service'
import type { Workshop } from '../types/catalog'

interface WorkshopWithCoords extends Workshop {
  coords: { lat: number; lng: number }
}

interface WorkshopMapProps {
  workshops: Workshop[]
  height?: string | number
}

// Popup que se muestra al hacer click en un marker del mapa
const WorkshopPopup = ({ workshop }: { workshop: WorkshopWithCoords }) => {
  const navigate = useNavigate()

  return (
    <Box sx={{ minWidth: 180 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        {workshop.name}
      </Typography>

      {workshop.city && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {workshop.address ? `${workshop.address}, ` : ''}{workshop.city}
          </Typography>
        </Box>
      )}

      {workshop.phone && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
          <Link
            href={`tel:${workshop.phone}`}
            variant="caption"
            underline="hover"
          >
            {workshop.phone}
          </Link>
        </Box>
      )}

      <Button
        variant="contained"
        size="small"
        fullWidth
        onClick={() => navigate(`/talleres/${workshop.id}`)}
        sx={{ mt: 0.5, borderRadius: 2, textTransform: 'none' }}
      >
        Ver taller
      </Button>
    </Box>
  )
}

// Estado de carga del geocoding
const GeocodingProgress = ({
  geocoded,
  total,
}: {
  geocoded: number
  total: number
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      py: 8,
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Localizando talleres en el mapa... ({geocoded}/{total})
    </Typography>
  </Box>
)

/**
 * Mapa de talleres con geocoding automático (Nominatim + caché localStorage).
 * Muestra un popup con info del taller al hacer click en un marker.
 */
export const WorkshopMap = ({ workshops, height = 520 }: WorkshopMapProps) => {
  const [markers, setMarkers] = useState<MapMarkerConfig<WorkshopWithCoords>[]>([])
  const [geocodedCount, setGeocodedCount] = useState(0)
  const [isGeocoding, setIsGeocoding] = useState(false)

  useEffect(() => {
    if (workshops.length === 0) {
      setMarkers([])
      return
    }

    let cancelled = false

    const runGeocoding = async () => {
      setIsGeocoding(true)
      setGeocodedCount(0)
      const newMarkers: MapMarkerConfig<WorkshopWithCoords>[] = []

      for (const workshop of workshops) {
        if (cancelled) break

        // Necesitamos al menos ciudad para geocodificar
        if (!workshop.address && !workshop.city) {
          setGeocodedCount((c) => c + 1)
          continue
        }

        const coords = await geocodeAddress(
          workshop.address ?? '',
          workshop.city
        )

        if (coords && !cancelled) {
          newMarkers.push({
            id: workshop.id,
            coords,
            data: { ...workshop, coords },
          })
          // Actualizar markers progresivamente para dar feedback visual
          setMarkers([...newMarkers])
        }

        if (!cancelled) setGeocodedCount((c) => c + 1)
      }

      if (!cancelled) setIsGeocoding(false)
    }

    runGeocoding()
    return () => {
      cancelled = true
    }
  }, [workshops])

  if (isGeocoding && geocodedCount === 0) {
    return <GeocodingProgress geocoded={geocodedCount} total={workshops.length} />
  }

  if (!isGeocoding && markers.length === 0 && workshops.length > 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography color="text.secondary">
          No se pudieron localizar los talleres en el mapa.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {isGeocoding && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 1000,
            bgcolor: 'background.paper',
            borderRadius: 2,
            px: 1.5,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: 2,
          }}
        >
          <CircularProgress size={14} />
          <Typography variant="caption">
            Localizando {geocodedCount}/{workshops.length}
          </Typography>
        </Box>
      )}

      <LeafletMap<WorkshopWithCoords>
        markers={markers}
        height={height}
        renderPopup={(workshop) => <WorkshopPopup workshop={workshop} />}
      />

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
        {markers.length} de {workshops.length} talleres localizados
      </Typography>
    </Box>
  )
}
