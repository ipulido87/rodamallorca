import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { DirectionsBike, OpenInNew, Timer, Terrain } from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import { ScrollReveal } from './ScrollReveal'
import { ROUTES, DIFFICULTY_COLOR } from '../constants/cycling-routes'
import type { CyclingRoute } from '../types/routes'

// Fix Leaflet marker icons in Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function MapFlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 })
  }, [center, zoom, map])
  return null
}

const makeIcon = (color: string, label: 'A' | 'B') =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      background:${color};border:2.5px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.45);
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;color:white;font-family:sans-serif;
    ">${label}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })

// ─── Componente principal ─────────────────────────────────────────────────────

export function RoutesSection() {
  const theme = useTheme()
  const { t } = useTranslation()
  const [selected, setSelected] = useState<CyclingRoute>(ROUTES[0])

  const start = selected.coords[0]
  const end   = selected.coords[selected.coords.length - 1]

  return (
    <Box
      id="rutas"
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(180deg, #0d1b2a 0%, #0a1f3d 100%)',
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <ScrollReveal>
          <Stack spacing={1.5} alignItems="center" sx={{ mb: 6, textAlign: 'center' }}>
            <Chip
              icon={<DirectionsBike />}
              label={t('routes.sectionBadge')}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                color: theme.palette.primary.light,
                fontWeight: 700,
                fontSize: '0.8rem',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            />
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: 'white', fontSize: { xs: '2rem', md: '2.8rem' } }}
            >
              {t('routes.sectionTitle')}
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: alpha('#ffffff', 0.6), fontWeight: 300, maxWidth: 560 }}
            >
              {t('routes.sectionSubtitle')}
            </Typography>
          </Stack>
        </ScrollReveal>

        {/* Tabs de selección */}
        <ScrollReveal delay={0.1}>
          <Stack direction="row" sx={{ mb: 0, flexWrap: 'wrap', gap: 1 }}>
            {ROUTES.map((route) => {
              const active = selected.id === route.id
              return (
                <Box
                  key={route.id}
                  onClick={() => setSelected(route)}
                  sx={{
                    cursor: 'pointer',
                    px: 2.5,
                    py: 1,
                    borderRadius: '8px 8px 0 0',
                    border: '1.5px solid',
                    borderBottom: 'none',
                    borderColor: active ? route.color : alpha('#ffffff', 0.12),
                    backgroundColor: active ? alpha(route.color, 0.14) : 'transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: alpha(route.color, 0.5),
                      backgroundColor: alpha(route.color, 0.07),
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: active ? 'white' : alpha('#ffffff', 0.55),
                      fontWeight: active ? 700 : 400,
                      whiteSpace: 'nowrap',
                      fontSize: '0.85rem',
                    }}
                  >
                    {route.name}
                  </Typography>
                </Box>
              )
            })}
          </Stack>
        </ScrollReveal>

        {/* Mapa + stats */}
        <ScrollReveal delay={0.15}>
          <Box
            sx={{
              borderRadius: '0 8px 8px 8px',
              overflow: 'hidden',
              border: `1.5px solid ${alpha(selected.color, 0.45)}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
              transition: 'border-color 0.3s',
            }}
          >
            {/* Mapa */}
            <Box sx={{ height: { xs: 320, md: 440 } }}>
              <MapContainer
                center={selected.mapCenter}
                zoom={selected.zoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <MapFlyTo center={selected.mapCenter} zoom={selected.zoom} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Polyline
                  positions={selected.coords}
                  pathOptions={{ color: selected.color, weight: 5, opacity: 0.9, lineJoin: 'round', lineCap: 'round' }}
                />
                <Marker position={start} icon={makeIcon(selected.color, 'A')} />
                <Marker position={end}   icon={makeIcon(selected.color, 'B')} />
              </MapContainer>
            </Box>

            {/* Stats strip */}
            <Box
              sx={{
                px: { xs: 2, md: 3 },
                py: 2,
                background: '#0a1628',
                borderTop: `2px solid ${selected.color}`,
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1.5, sm: 3 }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2 }}>
                    {selected.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.45) }}>
                    {selected.subtitle}
                  </Typography>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#ffffff', 0.1), display: { xs: 'none', sm: 'block' } }} />

                <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap" sx={{ gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <DirectionsBike sx={{ fontSize: 15, color: alpha('#ffffff', 0.4) }} />
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {selected.distance} km
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Terrain sx={{ fontSize: 15, color: alpha('#ffffff', 0.4) }} />
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      +{selected.elevation} m
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                    <Timer sx={{ fontSize: 15, color: alpha('#ffffff', 0.4) }} />
                    <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                      {selected.duration}
                    </Typography>
                  </Box>
                  <Chip
                    label={selected.difficulty}
                    size="small"
                    sx={{
                      backgroundColor: alpha(DIFFICULTY_COLOR[selected.difficulty], 0.2),
                      color: DIFFICULTY_COLOR[selected.difficulty],
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      border: `1px solid ${alpha(DIFFICULTY_COLOR[selected.difficulty], 0.35)}`,
                    }}
                  />
                  <Chip
                    label={selected.bikeType}
                    size="small"
                    sx={{ backgroundColor: alpha('#ffffff', 0.07), color: alpha('#ffffff', 0.55), fontSize: '0.7rem' }}
                  />
                </Stack>

                <Divider orientation="vertical" flexItem sx={{ borderColor: alpha('#ffffff', 0.1), display: { xs: 'none', sm: 'block' } }} />

                <Button
                  href={selected.komootUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                  sx={{
                    color: 'white',
                    border: `1px solid ${alpha('#ffffff', 0.22)}`,
                    borderRadius: 1.5,
                    px: 2,
                    py: 0.7,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    flexShrink: 0,
                    '&:hover': {
                      borderColor: selected.color,
                      backgroundColor: alpha(selected.color, 0.1),
                    },
                  }}
                >
                  {t('routes.viewOnKomoot')}
                </Button>
              </Stack>
            </Box>
          </Box>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.2}>
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.4), mb: 2 }}>
              {t('routes.ctaText')}
            </Typography>
            <Button
              href="/rentals"
              variant="outlined"
              startIcon={<DirectionsBike />}
              sx={{
                borderColor: alpha('#ffffff', 0.25),
                color: 'white',
                borderRadius: 2,
                px: 4,
                py: 1.2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {t('routes.ctaButton')}
            </Button>
          </Box>
        </ScrollReveal>
      </Container>
    </Box>
  )
}
