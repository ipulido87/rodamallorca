import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Inventory2 from '@mui/icons-material/Inventory2'
import DirectionsBike from '@mui/icons-material/DirectionsBike'
import type { SxProps, Theme } from '@mui/material/styles'
import { getOptimizedImageUrl, type CloudinaryPreset } from '../utils/cloudinary'

const GRADIENT = 'linear-gradient(135deg, #1a6b3c 0%, #2d9e5f 100%)'

interface ProductImageProps {
  src?: string | null
  preset?: CloudinaryPreset
  alt: string
  height?: number | string
  sx?: SxProps<Theme>
  /** Si true, usa ícono de bici en vez de caja de inventario */
  isBike?: boolean
}

/**
 * Imagen de producto con placeholder genérico de marketplace.
 * Para imágenes de galería de productos de segunda mano.
 */
export function ProductImage({ src, preset = 'catalog', alt, height = 400, sx, isBike = false }: ProductImageProps) {
  const [errored, setErrored] = useState(false)

  const optimized = src ? getOptimizedImageUrl(src, preset) : null
  const showPlaceholder = !optimized || errored

  if (showPlaceholder) {
    const Icon = isBike ? DirectionsBike : Inventory2
    return (
      <Box
        sx={{
          width: '100%',
          height,
          background: GRADIENT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          ...sx,
        }}
      >
        <Icon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.85)' }} />
        <Typography
          variant="caption"
          sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}
        >
          Sin foto
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      component="img"
      src={optimized}
      alt={alt}
      onError={() => setErrored(true)}
      sx={{ width: '100%', height, objectFit: 'cover', display: 'block', ...sx }}
    />
  )
}
