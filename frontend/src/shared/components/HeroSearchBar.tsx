import { AutoAwesome, Build, PedalBike, Search, Store } from '@mui/icons-material'
import {
  alpha,
  Box,
  ButtonBase,
  Chip,
  InputBase,
  Stack,
  Typography,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { detectIntent, parseQuery } from '../search'
import type { SearchIntent } from '../search'

const MotionBox = motion.create(Box)

// Ejemplos de queries para animar el placeholder
const EXAMPLE_QUERIES = [
  'Quiero alquilar una bici de montaña en Palma',
  'Taller para reparar mi bici en Sóller',
  'Freno Shimano de segunda mano barato',
  'Taller bien valorado cerca de Alcúdia',
  'Llanta de carbono menos de 200€',
  'Revisión completa de mi bicicleta',
  'Casco nuevo para ciclismo de ruta',
  'Mecánico en Pollença urgente',
]

const INTENT_META: Record<SearchIntent, { label: string; icon: React.ReactNode; color: string }> = {
  talleres: {
    label: 'Buscar en Talleres',
    icon: <Build sx={{ fontSize: 18 }} />,
    color: '#5c6bc0',
  },
  productos: {
    label: 'Buscar en Productos',
    icon: <Store sx={{ fontSize: 18 }} />,
    color: '#26a69a',
  },
  alquiler: {
    label: 'Buscar Alquiler',
    icon: <PedalBike sx={{ fontSize: 18 }} />,
    color: '#4caf50',
  },
}

export function HeroSearchBar() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showPlaceholderAnim, setShowPlaceholderAnim] = useState(true)

  // Rotate placeholder examples every 3.5s when input is empty
  useEffect(() => {
    if (query.trim()) return
    const interval = setInterval(() => {
      setShowPlaceholderAnim(false)
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % EXAMPLE_QUERIES.length)
        setShowPlaceholderAnim(true)
      }, 300)
    }, 3500)
    return () => clearInterval(interval)
  }, [query])

  const intent = query.trim() ? detectIntent(query) : null
  const parsed = query.trim() ? parseQuery(query) : null

  const handleSubmit = () => {
    const q = query.trim()
    if (!q) return
    const destination = detectIntent(q)
    const params = new URLSearchParams({ q })
    if (destination === 'talleres') navigate(`/talleres?${params}`)
    else if (destination === 'alquiler') navigate(`/rentals?${params}`)
    else navigate(`/productos?${params}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const intentMeta = intent ? INTENT_META[intent] : null

  return (
    <Box sx={{ width: '100%', maxWidth: 680 }}>
      {/* Search box */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0, ease: 'easeOut' }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: alpha('#ffffff', 0.12),
          backdropFilter: 'blur(20px)',
          border: `1.5px solid ${alpha('#ffffff', 0.25)}`,
          borderRadius: 3,
          px: 2,
          py: 0.5,
          gap: 1,
          transition: 'border-color 0.2s, background-color 0.2s',
          '&:focus-within': {
            borderColor: alpha('#ffffff', 0.55),
            backgroundColor: alpha('#ffffff', 0.16),
          },
        }}
      >
        {/* Icon */}
        <AutoAwesome
          sx={{
            color: query.trim() ? alpha('#ffffff', 0.9) : alpha('#ffffff', 0.5),
            fontSize: 22,
            flexShrink: 0,
            transition: 'color 0.2s',
          }}
        />

        {/* Input with animated placeholder */}
        <Box sx={{ flex: 1, position: 'relative', py: 1.2 }}>
          <InputBase
            inputRef={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              width: '100%',
              color: 'white',
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              fontWeight: 400,
              '& input': {
                padding: 0,
                '&::placeholder': { color: 'transparent' },
              },
            }}
            inputProps={{ 'aria-label': 'Buscador inteligente RodaMallorca' }}
          />

          {/* Animated placeholder when empty */}
          {!query && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
              onClick={() => inputRef.current?.focus()}
            >
              <AnimatePresence mode="wait">
                {showPlaceholderAnim && (
                  <motion.span
                    key={placeholderIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      color: alpha('#ffffff', 0.45),
                      fontSize: 'inherit',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      width: '100%',
                    }}
                  >
                    {EXAMPLE_QUERIES[placeholderIndex]}
                  </motion.span>
                )}
              </AnimatePresence>
            </Box>
          )}
        </Box>

        {/* Submit button */}
        <ButtonBase
          onClick={handleSubmit}
          disabled={!query.trim()}
          sx={{
            backgroundColor: query.trim()
              ? intentMeta?.color ?? '#3949ab'
              : alpha('#ffffff', 0.15),
            color: 'white',
            borderRadius: 2,
            px: 2.5,
            py: 1,
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            flexShrink: 0,
            transition: 'background-color 0.25s',
            '&:hover': {
              backgroundColor: query.trim()
                ? alpha(intentMeta?.color ?? '#3949ab', 0.85)
                : alpha('#ffffff', 0.22),
            },
          }}
        >
          <Search sx={{ fontSize: 18 }} />
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Buscar
          </Box>
        </ButtonBase>
      </MotionBox>

      {/* Intent chip + parsed filters */}
      <AnimatePresence>
        {query.trim() && intentMeta && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.8 }}>
              {/* Intent */}
              <Chip
                icon={<Box sx={{ display: 'flex', color: 'white !important' }}>{intentMeta.icon}</Box>}
                label={intentMeta.label}
                size="small"
                sx={{
                  backgroundColor: alpha(intentMeta.color, 0.85),
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  backdropFilter: 'blur(10px)',
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />

              {/* Parsed filters */}
              {parsed?.city && (
                <Chip
                  label={`📍 ${parsed.city}`}
                  size="small"
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.18),
                    color: 'white',
                    fontSize: '0.72rem',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}
              {parsed?.condition === 'used' && (
                <Chip
                  label="♻️ Segunda mano"
                  size="small"
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.18),
                    color: 'white',
                    fontSize: '0.72rem',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}
              {parsed?.condition === 'new' && (
                <Chip
                  label="✨ Nuevo"
                  size="small"
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.18),
                    color: 'white',
                    fontSize: '0.72rem',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}
              {parsed?.sort === 'price_asc' && (
                <Chip
                  label="💰 Más barato"
                  size="small"
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.18),
                    color: 'white',
                    fontSize: '0.72rem',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}
              {parsed?.sort === 'rating_desc' && (
                <Chip
                  label="⭐ Mejor valorado"
                  size="small"
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.18),
                    color: 'white',
                    fontSize: '0.72rem',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}
              {parsed?.maxPrice && (
                <Chip
                  label={`Hasta ${parsed.maxPrice}€`}
                  size="small"
                  sx={{
                    backgroundColor: alpha('#ffffff', 0.18),
                    color: 'white',
                    fontSize: '0.72rem',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      {!query.trim() && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1,
            color: alpha('#ffffff', 0.4),
            fontSize: '0.72rem',
            pl: 0.5,
          }}
        >
          Escribe en lenguaje natural · Pulsa Enter para buscar
        </Typography>
      )}
    </Box>
  )
}
