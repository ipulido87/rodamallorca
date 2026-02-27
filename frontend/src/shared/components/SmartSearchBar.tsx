import {
  AutoAwesome,
  Build,
  Clear,
  PedalBike,
  Search,
  Store,
} from '@mui/icons-material'
import {
  alpha,
  Box,
  ButtonBase,
  Chip,
  IconButton,
  InputAdornment,
  InputBase,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { detectIntent, parseQuery } from '../search'
import type { ParsedQuery, SearchIntent } from '../search'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SmartSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  parsedQuery?: ParsedQuery
  showHints?: boolean
  /**
   * 'catalog' (default): estilo MUI TextField, para páginas de Talleres/Productos.
   * 'hero': estilo glassmorphism oscuro con placeholder animado y navegación al enviar.
   */
  variant?: 'catalog' | 'hero'
}

// ─── Datos del hero ────────────────────────────────────────────────────────────

const HERO_EXAMPLES = [
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
  talleres: { label: 'Buscar en Talleres', icon: <Build sx={{ fontSize: 18 }} />, color: '#5c6bc0' },
  productos: { label: 'Buscar en Productos', icon: <Store sx={{ fontSize: 18 }} />, color: '#26a69a' },
  alquiler: { label: 'Buscar Alquiler', icon: <PedalBike sx={{ fontSize: 18 }} />, color: '#4caf50' },
}

// ─── Chips de filtros detectados (compartido entre variantes) ──────────────────

const ParsedQueryChips = ({
  parsed,
  dark = false,
}: {
  parsed: ParsedQuery
  dark?: boolean
}) => {
  const chips: Array<{ label: string; color?: 'primary' | 'secondary' | 'success' | 'warning' }> = []

  if (parsed.city) chips.push({ label: `📍 ${parsed.city}`, color: 'primary' })
  if (parsed.condition === 'used') chips.push({ label: '♻️ Segunda mano', color: 'secondary' })
  if (parsed.condition === 'new') chips.push({ label: '✨ Nuevo', color: 'success' })
  if (parsed.sort === 'price_asc') chips.push({ label: '💰 Más barato', color: 'warning' })
  if (parsed.sort === 'price_desc') chips.push({ label: '💎 Premium', color: 'warning' })
  if (parsed.sort === 'rating_desc') chips.push({ label: '⭐ Mejor valorado', color: 'success' })
  if (parsed.maxPrice) chips.push({ label: `Hasta ${parsed.maxPrice}€`, color: 'secondary' })
  if (parsed.minPrice) chips.push({ label: `Desde ${parsed.minPrice}€`, color: 'secondary' })

  if (chips.length === 0) return null

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
      {!dark && (
        <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', mr: 0.5 }}>
          Detectado:
        </Typography>
      )}
      {chips.map((chip) =>
        dark ? (
          <Chip
            key={chip.label}
            label={chip.label}
            size="small"
            sx={{
              backgroundColor: alpha('#ffffff', 0.18),
              color: 'white',
              fontSize: '0.72rem',
              backdropFilter: 'blur(10px)',
            }}
          />
        ) : (
          <Chip
            key={chip.label}
            label={chip.label}
            size="small"
            color={chip.color}
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        )
      )}
    </Box>
  )
}

// ─── Variante catalog (Talleres / Productos) ───────────────────────────────────

const CatalogSearchBar = ({
  value,
  onChange,
  placeholder,
  parsedQuery,
  showHints,
}: Omit<SmartSearchBarProps, 'variant'>) => {
  const hasValue = value.trim().length > 0

  return (
    <Box sx={{ width: '100%', maxWidth: 640, mx: 'auto' }}>
      <TextField
        fullWidth
        variant="outlined"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Busca en lenguaje natural: "freno usado barato en Palma"...'}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Tooltip title="Búsqueda inteligente: entiende lenguaje natural">
                <AutoAwesome sx={{ color: 'primary.main', fontSize: 20 }} />
              </Tooltip>
            </InputAdornment>
          ),
          endAdornment: hasValue ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onChange('')} aria-label="Limpiar búsqueda">
                <Clear fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : (
            <InputAdornment position="end">
              <Search sx={{ color: 'action.active' }} />
            </InputAdornment>
          ),
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />

      {showHints && parsedQuery && hasValue && <ParsedQueryChips parsed={parsedQuery} />}
    </Box>
  )
}

// ─── Variante hero (Landing page) ─────────────────────────────────────────────

const HeroSearchBar = ({ value, onChange }: Pick<SmartSearchBarProps, 'value' | 'onChange'>) => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [showPlaceholderAnim, setShowPlaceholderAnim] = useState(true)

  // Rota los ejemplos de placeholder cada 3.5 s mientras el input está vacío
  useEffect(() => {
    if (value.trim()) return
    const interval = setInterval(() => {
      setShowPlaceholderAnim(false)
      setTimeout(() => {
        setPlaceholderIndex((i) => (i + 1) % HERO_EXAMPLES.length)
        setShowPlaceholderAnim(true)
      }, 300)
    }, 3500)
    return () => clearInterval(interval)
  }, [value])

  const intent = value.trim() ? detectIntent(value) : null
  const parsed = value.trim() ? parseQuery(value) : null
  const intentMeta = intent ? INTENT_META[intent] : null

  const handleSubmit = () => {
    const q = value.trim()
    if (!q) return
    const destination = detectIntent(q)
    const params = new URLSearchParams({ q })
    if (destination === 'talleres') navigate(`/talleres?${params}`)
    else if (destination === 'alquiler') navigate(`/rentals?${params}`)
    else navigate(`/productos?${params}`)
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 680 }}>
      {/* Caja del input */}
      <Box
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
        <AutoAwesome
          sx={{
            color: value.trim() ? alpha('#ffffff', 0.9) : alpha('#ffffff', 0.5),
            fontSize: 22,
            flexShrink: 0,
            transition: 'color 0.2s',
          }}
        />

        {/* Input con placeholder animado */}
        <Box sx={{ flex: 1, position: 'relative', py: 1.2 }}>
          <InputBase
            inputRef={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            sx={{
              width: '100%',
              color: 'white',
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              '& input': { padding: 0, '&::placeholder': { color: 'transparent' } },
            }}
            inputProps={{ 'aria-label': 'Buscador inteligente RodaMallorca' }}
          />

          {!value && (
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
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'block',
                      width: '100%',
                    }}
                  >
                    {HERO_EXAMPLES[placeholderIndex]}
                  </motion.span>
                )}
              </AnimatePresence>
            </Box>
          )}
        </Box>

        {/* Botón enviar */}
        <ButtonBase
          onClick={handleSubmit}
          disabled={!value.trim()}
          sx={{
            backgroundColor: value.trim()
              ? (intentMeta?.color ?? '#3949ab')
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
              backgroundColor: value.trim()
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
      </Box>

      {/* Chip de intención + filtros detectados */}
      <AnimatePresence>
        {value.trim() && intentMeta && parsed && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.8 }}>
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
              <ParsedQueryChips parsed={parsed} dark />
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>

      {!value.trim() && (
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 1, color: alpha('#ffffff', 0.4), fontSize: '0.72rem', pl: 0.5 }}
        >
          Escribe en lenguaje natural · Pulsa Enter para buscar
        </Typography>
      )}
    </Box>
  )
}

// ─── Componente público ────────────────────────────────────────────────────────

/**
 * Barra de búsqueda inteligente con NLP en español.
 *
 * variant="catalog" (default): TextField MUI para páginas de Talleres y Productos.
 * variant="hero": glassmorphism oscuro con placeholder animado para la landing page.
 *
 * Ejemplos de queries que entiende:
 *   "freno shimano usado barato Palma"
 *   "taller cerca de Sóller bien valorado"
 *   "alquilar bici de montaña el sábado"
 */
export const SmartSearchBar = ({
  variant = 'catalog',
  ...props
}: SmartSearchBarProps) => {
  if (variant === 'hero') {
    return <HeroSearchBar value={props.value} onChange={props.onChange} />
  }
  return <CatalogSearchBar {...props} />
}
