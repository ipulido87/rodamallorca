import { DirectionsBike, OpenInNew } from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import { useState } from 'react'
import { ScrollReveal } from './ScrollReveal'

// ─── Datos de rutas ────────────────────────────────────────────────────────────
// Actualiza name, distance, elevation y difficulty con los datos reales de Komoot.

interface Route {
  id: string
  name: string
  distance: string
  elevation: string
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Épica'
  bikeType: string
  embedUrl: string
  komootUrl: string
}

const ROUTES: Route[] = [
  {
    id: 'route-1',
    name: 'Ruta 1 — Mallorca',
    distance: '—',
    elevation: '—',
    difficulty: 'Medio',
    bikeType: 'Carretera',
    embedUrl: 'https://www.komoot.com/smarttour/31967033/embed?profile=1',
    komootUrl: 'https://www.komoot.com/es-es/smarttour/31967033',
  },
  {
    id: 'route-2',
    name: 'Ruta 2 — Mallorca',
    distance: '—',
    elevation: '—',
    difficulty: 'Difícil',
    bikeType: 'Carretera',
    embedUrl: 'https://www.komoot.com/smarttour/38147187/embed?profile=1',
    komootUrl: 'https://www.komoot.com/es-es/smarttour/38147187',
  },
  {
    id: 'route-3',
    name: 'Ruta 3 — Mallorca',
    distance: '—',
    elevation: '—',
    difficulty: 'Épica',
    bikeType: 'Carretera',
    embedUrl: 'https://www.komoot.com/smarttour/32559666/embed?profile=1',
    komootUrl: 'https://www.komoot.com/es-es/smarttour/32559666',
  },
  {
    id: 'route-4',
    name: 'Highlight — Mallorca',
    distance: '—',
    elevation: '—',
    difficulty: 'Fácil',
    bikeType: 'Carretera / Gravel',
    embedUrl: 'https://www.komoot.com/highlight/178576/embed',
    komootUrl: 'https://www.komoot.com/es-es/highlight/178576',
  },
  {
    id: 'route-5',
    name: 'Ruta 5 — Mallorca',
    distance: '—',
    elevation: '—',
    difficulty: 'Medio',
    bikeType: 'Gravel',
    embedUrl: 'https://www.komoot.com/smarttour/40381010/embed?profile=1',
    komootUrl: 'https://www.komoot.com/smarttour/40381010',
  },
]

const DIFFICULTY_COLOR: Record<Route['difficulty'], string> = {
  'Fácil': '#2e7d32',
  'Medio': '#f57c00',
  'Difícil': '#c62828',
  'Épica': '#6a1b9a',
}

// ─── Componente ────────────────────────────────────────────────────────────────

export function RoutesSection() {
  const theme = useTheme()
  const [selected, setSelected] = useState<Route>(ROUTES[0])

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
              label="RUTAS EN MALLORCA"
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
              Rutas para todos los niveles
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: alpha('#ffffff', 0.6), fontWeight: 300, maxWidth: 560 }}
            >
              Explora las rutas más espectaculares de la isla antes de reservar tu bici
            </Typography>
          </Stack>
        </ScrollReveal>

        {/* Selector de rutas */}
        <ScrollReveal delay={0.1}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 3, flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}
          >
            {ROUTES.map((route) => (
              <Box
                key={route.id}
                onClick={() => setSelected(route)}
                sx={{
                  cursor: 'pointer',
                  px: 2.5,
                  py: 1.2,
                  borderRadius: 2,
                  border: '1.5px solid',
                  borderColor:
                    selected.id === route.id
                      ? theme.palette.primary.main
                      : alpha('#ffffff', 0.15),
                  backgroundColor:
                    selected.id === route.id
                      ? alpha(theme.palette.primary.main, 0.15)
                      : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.6),
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: selected.id === route.id ? theme.palette.primary.light : alpha('#ffffff', 0.7),
                    fontWeight: selected.id === route.id ? 600 : 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {route.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </ScrollReveal>

        {/* Iframe + stats */}
        <ScrollReveal delay={0.15}>
          <Box
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha('#ffffff', 0.1)}`,
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            }}
          >
            {/* Stats bar */}
            <Box
              sx={{
                px: 3,
                py: 1.5,
                background: alpha('#0a1628', 0.95),
                borderBottom: `1px solid ${alpha('#ffffff', 0.08)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, mr: 1 }}>
                {selected.name}
              </Typography>

              {selected.distance !== '—' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>📍</Typography>
                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.8), fontWeight: 600 }}>
                    {selected.distance} km
                  </Typography>
                </Box>
              )}

              {selected.elevation !== '—' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.5) }}>⬆</Typography>
                  <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.8), fontWeight: 600 }}>
                    {selected.elevation} m
                  </Typography>
                </Box>
              )}

              <Chip
                label={selected.difficulty}
                size="small"
                sx={{
                  backgroundColor: alpha(DIFFICULTY_COLOR[selected.difficulty], 0.2),
                  color: DIFFICULTY_COLOR[selected.difficulty],
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  border: `1px solid ${alpha(DIFFICULTY_COLOR[selected.difficulty], 0.3)}`,
                }}
              />

              <Chip
                label={selected.bikeType}
                size="small"
                sx={{
                  backgroundColor: alpha('#ffffff', 0.08),
                  color: alpha('#ffffff', 0.6),
                  fontSize: '0.7rem',
                }}
              />

              <Button
                href={selected.komootUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                sx={{
                  ml: 'auto',
                  color: theme.palette.primary.light,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  '&:hover': { color: theme.palette.primary.main },
                }}
              >
                Ver en Komoot
              </Button>
            </Box>

            {/* Komoot iframe */}
            <Box
              component="iframe"
              key={selected.id}
              src={selected.embedUrl}
              title={`Ruta: ${selected.name}`}
              sx={{
                display: 'block',
                width: '100%',
                height: { xs: 380, md: 500 },
                border: 'none',
                background: '#1a2a3a',
              }}
              allowFullScreen
            />
          </Box>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal delay={0.2}>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.5), mb: 2 }}>
              ¿Tienes una ruta favorita? Alquila la bici perfecta para hacerla
            </Typography>
            <Button
              href="/rentals"
              variant="outlined"
              startIcon={<DirectionsBike />}
              sx={{
                borderColor: alpha('#ffffff', 0.3),
                color: 'white',
                borderRadius: 2,
                px: 4,
                py: 1.2,
                textTransform: 'none',
                '&:hover': { borderColor: theme.palette.primary.main, backgroundColor: alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              Ver bicicletas disponibles
            </Button>
          </Box>
        </ScrollReveal>
      </Container>
    </Box>
  )
}
