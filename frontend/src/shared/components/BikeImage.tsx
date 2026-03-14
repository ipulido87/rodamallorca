import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import DirectionsBike from '@mui/icons-material/DirectionsBike'
import ElectricBike from '@mui/icons-material/ElectricBike'
import PedalBike from '@mui/icons-material/PedalBike'
import Terrain from '@mui/icons-material/Terrain'
import type { SxProps, Theme } from '@mui/material/styles'
import { getOptimizedImageUrl, type CloudinaryPreset } from '../utils/cloudinary'

type BikeType = string | null | undefined

interface TypeConfig {
  gradient: string
  Icon: React.ElementType
  label: string
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  road:     { gradient: 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)', Icon: DirectionsBike, label: 'Carretera' },
  mountain: { gradient: 'linear-gradient(135deg, #4e342e 0%, #795548 100%)', Icon: Terrain,        label: 'Montaña' },
  gravel:   { gradient: 'linear-gradient(135deg, #558b2f 0%, #7cb342 100%)', Icon: DirectionsBike, label: 'Gravel' },
  ebike:    { gradient: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)', Icon: ElectricBike,   label: 'Eléctrica' },
  hybrid:   { gradient: 'linear-gradient(135deg, #00695c 0%, #00897b 100%)', Icon: PedalBike,      label: 'Híbrida' },
  city:     { gradient: 'linear-gradient(135deg, #4527a0 0%, #7b1fa2 100%)', Icon: PedalBike,      label: 'Ciudad' },
}

const DEFAULT_CONFIG: TypeConfig = {
  gradient: 'linear-gradient(135deg, #1a6b3c 0%, #2d9e5f 100%)',
  Icon: DirectionsBike,
  label: 'Bicicleta',
}

interface BikeImageProps {
  /** URL de imagen original (Cloudinary u otra) */
  src?: string | null
  /** Preset de Cloudinary para optimización */
  preset?: CloudinaryPreset
  /** Tipo de bici para el placeholder temático */
  bikeType?: BikeType
  alt: string
  height?: number | string
  sx?: SxProps<Theme>
  /** className adicional para CardMedia compatibility */
  className?: string
}

/**
 * Imagen de bici con placeholder branded por tipo.
 * - Si hay src válido: intenta cargar con optimización Cloudinary
 * - Si falla o está vacío: muestra placeholder con gradiente + ícono del tipo
 */
export function BikeImage({ src, preset = 'catalog', bikeType, alt, height = 200, sx, className }: Readonly<BikeImageProps>) {
  const [errored, setErrored] = useState(false)

  const optimized = src ? getOptimizedImageUrl(src, preset) : null
  const showPlaceholder = !optimized || errored

  if (showPlaceholder) {
    return <BikeImagePlaceholder bikeType={bikeType} height={height} sx={sx} />
  }

  return (
    <Box
      component="img"
      src={optimized}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      sx={{ width: '100%', height, objectFit: 'cover', display: 'block', ...sx }}
    />
  )
}

interface PlaceholderProps {
  bikeType?: BikeType
  height?: number | string
  sx?: SxProps<Theme>
}

export function BikeImagePlaceholder({ bikeType, height = 200, sx }: Readonly<PlaceholderProps>) {
  const config = (bikeType && TYPE_CONFIG[bikeType]) ?? DEFAULT_CONFIG
  const { gradient, Icon, label } = config

  return (
    <Box
      sx={{
        width: '100%',
        height,
        background: gradient,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        ...sx,
      }}
    >
      <Icon sx={{ fontSize: height === 200 ? 64 : 96, color: 'rgba(255,255,255,0.85)' }} />
      <Typography
        variant="caption"
        sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}
      >
        {label}
      </Typography>
    </Box>
  )
}
