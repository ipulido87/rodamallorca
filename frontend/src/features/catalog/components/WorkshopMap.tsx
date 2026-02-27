import { LocationOn, Phone } from '@mui/icons-material'
import { Alert, Box, Button, CircularProgress, Link, Typography } from '@mui/material'
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
          <Link href={`tel:${workshop.phone}`} variant="caption" underline="hover">
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

/**
 * Mapa de talleres con geocoding automático (Nominatim + caché localStorage).
 * El mapa se muestra siempre centrado en Mallorca.
 * Los markers aparecen progresivamente a medida que se geocodifican.
 */
export const WorkshopMap = ({ workshops, height = 520 }: WorkshopMapProps) => {
  const [markers, setMarkers] = useState<MapMarkerConfig<WorkshopWithCoords>[]>([])
  const [geocodedCount, setGeocodedCount] = useState(0)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodingDone, setGeocodingDone] = useState(false)

  useEffect(() => {
    if (workshops.length === 0) {
      setMarkers([])
      setGeocodingDone(true)
      return
    }

    let cancelled = false
    setMarkers([])
    setGeocodedCount(0)
    setGeocodingDone(false)
    setIsGeocoding(true)

    const runGeocoding = async () => {
      const newMarkers: MapMarkerConfig<WorkshopWithCoords>[] = []

      for (const workshop of workshops) {
        if (cancelled) break

        if (workshop.address || workshop.city) {
          const coords = await geocodeAddress(workshop.address ?? '', workshop.city)

          if (coords && !cancelled) {
            newMarkers.push({
              id: workshop.id,
              coords,
              data: { ...workshop, coords },
            })
            setMarkers([...newMarkers])
          }
        }

        if (!cancelled) setGeocodedCount((c) => c + 1)
      }

      if (!cancelled) {
        setIsGeocoding(false)
        setGeocodingDone(true)
      }
    }

    runGeocoding()
    return () => { cancelled = true }
  }, [workshops])

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Overlay de progreso — flota sobre el mapa mientras geocodifica */}
      {isGeocoding && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            bgcolor: 'background.paper',
            borderRadius: 2,
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: 3,
          }}
        >
          <CircularProgress size={16} />
          <Typography variant="caption">
            Localizando talleres... {geocodedCount}/{workshops.length}
          </Typography>
        </Box>
      )}

      {/* El mapa siempre se renderiza — centrado en Mallorca aunque no haya markers */}
      <LeafletMap<WorkshopWithCoords>
        markers={markers}
        height={height}
        renderPopup={(workshop) => <WorkshopPopup workshop={workshop} />}
      />

      {/* Aviso si terminó y no se geocodificó ninguno */}
      {geocodingDone && markers.length === 0 && workshops.length > 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          No se pudieron localizar los talleres en el mapa. Puede que no tengan dirección registrada.
        </Alert>
      )}

      {geocodingDone && markers.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
          {markers.length} de {workshops.length} talleres en el mapa
        </Typography>
      )}
    </Box>
  )
}
