import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Avatar,
  IconButton,
  Alert,
} from '@mui/material'
import { CloudUpload, Delete } from '@mui/icons-material'
import { uploadSingleImage, type ProcessedImage } from '../../media/services/media-service'

interface WorkshopLogoUploadProps {
  currentLogo?: string | null
  onLogoChange: (logo: ProcessedImage | null) => void
  disabled?: boolean
}

export const WorkshopLogoUpload = ({
  currentLogo,
  onLogoChange,
  disabled = false,
}: WorkshopLogoUploadProps) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(currentLogo || null)

  // Actualizar preview cuando cambie currentLogo
  useEffect(() => {
    setPreview(currentLogo || null)
  }, [currentLogo])

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    const ext = file.name.toLowerCase()
    if (
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      ext.endsWith('.heic') ||
      ext.endsWith('.heif')
    ) {
      setError(
        'El formato HEIC/HEIF (fotos de iPhone) no está soportado. Convierte la imagen a JPG o PNG antes de subirla.'
      )
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    // Validar tamaño (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      const processedImage = await uploadSingleImage(file)

      // Actualizar preview con la versión medium
      setPreview(processedImage.medium)

      // Notificar al componente padre
      onLogoChange(processedImage)
    } catch (err) {
      console.error('Error uploading logo:', err)
      setError('Error al subir la imagen. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    setPreview(null)
    onLogoChange(null)
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        Logo del Taller
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Preview del logo */}
        <Avatar
          src={preview || undefined}
          alt="Logo del taller"
          sx={{
            width: 120,
            height: 120,
            bgcolor: preview ? 'transparent' : 'grey.300',
            fontSize: '3rem',
          }}
        >
          {!preview && '🏪'}
        </Avatar>

        {/* Botones de acción */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            component="label"
            variant="contained"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            disabled={disabled || uploading}
          >
            {uploading ? 'Subiendo...' : preview ? 'Cambiar Logo' : 'Subir Logo'}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
              disabled={disabled || uploading}
            />
          </Button>

          {preview && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleRemoveLogo}
              disabled={disabled || uploading}
              size="small"
            >
              Eliminar
            </Button>
          )}

          <Typography variant="caption" color="text.secondary">
            Max 5MB. JPG, PNG, WebP (no HEIC/HEIF)
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
