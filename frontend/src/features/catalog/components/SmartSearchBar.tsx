import { AutoAwesome, Clear, Search } from '@mui/icons-material'
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ParsedQuery } from '../../../shared/search'

interface SmartSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  parsedQuery?: ParsedQuery
  showHints?: boolean
}

// Chips que muestran qué filtros extrajo el parser del lenguaje natural
const ParsedQueryChips = ({ parsed }: { parsed: ParsedQuery }) => {
  const chips: Array<{ label: string; color: 'primary' | 'secondary' | 'success' | 'warning' }> = []

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
      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', mr: 0.5 }}>
        Detectado:
      </Typography>
      {chips.map((chip) => (
        <Chip
          key={chip.label}
          label={chip.label}
          size="small"
          color={chip.color}
          variant="outlined"
          sx={{ fontSize: '0.7rem' }}
        />
      ))}
    </Box>
  )
}

/**
 * Barra de búsqueda inteligente con NLP básico en español.
 * Muestra chips con los filtros detectados en el lenguaje natural del usuario.
 *
 * Ejemplos de queries que entiende:
 *   "freno shimano usado barato Palma"
 *   "taller cerca de Sóller bien valorado"
 *   "llanta menos de 50 euros"
 */
export const SmartSearchBar = ({
  value,
  onChange,
  placeholder = 'Busca en lenguaje natural: "freno usado barato en Palma"...',
  parsedQuery,
  showHints = true,
}: SmartSearchBarProps) => {
  const hasValue = value.trim().length > 0

  return (
    <Box sx={{ width: '100%', maxWidth: 640, mx: 'auto' }}>
      <TextField
        fullWidth
        variant="outlined"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
          },
        }}
      />

      {showHints && parsedQuery && hasValue && (
        <ParsedQueryChips parsed={parsedQuery} />
      )}
    </Box>
  )
}
