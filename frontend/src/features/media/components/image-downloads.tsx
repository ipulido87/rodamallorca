import { CloudUpload, Delete, Image as ImageIcon } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  Typography,
} from '@mui/material'
import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getImageUrl } from '../../../utils/api-urls'
import type { ProcessedImage } from '../services/media-service'
import { uploadMultipleImages } from '../services/media-service'

interface ImageUploadProps {
  maxImages?: number
  currentImages?: ProcessedImage[]
  onImagesChange: (images: ProcessedImage[]) => void
  disabled?: boolean
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  maxImages = 5,
  currentImages = [],
  onImagesChange,
  disabled = false,
}) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Validar número máximo de imágenes
    const totalImages = currentImages.length + files.length
    if (totalImages > maxImages) {
      setError(t('media.maxImagesAllowed', { max: maxImages }))
      return
    }

    // Validar tipos de archivo
    const validFiles = Array.from(files).filter((file) => {
      const ext = file.name.toLowerCase()
      if (
        file.type === 'image/heic' ||
        file.type === 'image/heif' ||
        ext.endsWith('.heic') ||
        ext.endsWith('.heif')
      ) {
        setError(t('media.heicNotSupported'))
        return false
      }
      if (!file.type.startsWith('image/')) {
        setError(t('media.onlyImagesAllowed'))
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setError(t('media.imageTooLarge'))
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    try {
      setLoading(true)
      setError('')

      const uploadedImages = await uploadMultipleImages(validFiles)
      const newImages = [...currentImages, ...uploadedImages]
      onImagesChange(newImages)

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(t('media.uploadError'))
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('media.productImages')}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('media.imageRequirements', { max: maxImages })}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Botón de upload */}
      <Card
        sx={{
          mb: 2,
          border: '2px dashed',
          borderColor: disabled ? 'grey.300' : 'primary.main',
          cursor: disabled ? 'not-allowed' : 'pointer',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.dark',
            backgroundColor: disabled ? 'transparent' : 'action.hover',
          },
        }}
        onClick={!disabled && !loading ? handleUploadClick : undefined}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          {loading ? (
            <CircularProgress size={40} />
          ) : (
            <>
              <CloudUpload
                sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
              />
              <Typography variant="h6" gutterBottom>
                {currentImages.length === 0
                  ? t('media.uploadFirstImages')
                  : t('media.addMoreImages')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('media.clickToSelectOrDrag')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<ImageIcon />}
                sx={{ mt: 2 }}
                disabled={
                  disabled || loading || currentImages.length >= maxImages
                }
              >
                Seleccionar imágenes
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={disabled || loading}
      />

      {/* Vista previa de imágenes */}
      {currentImages.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Imágenes cargadas ({currentImages.length}/{maxImages})
          </Typography>

          <ImageList cols={3} gap={8}>
            {currentImages.map((image, index) => (
              <ImageListItem key={index} sx={{ position: 'relative' }}>
                <img
                  src={getImageUrl(image.medium)}
                  alt={`Imagen ${index + 1}`}
                  style={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />

                {/* Botón de eliminar */}
                <IconButton
                  onClick={() => handleRemoveImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.8)',
                    },
                  }}
                  size="small"
                  disabled={disabled}
                >
                  <Delete fontSize="small" />
                </IconButton>

                {/* Indicador de imagen principal */}
                {index === 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      left: 8,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                    }}
                  >
                    Principal
                  </Box>
                )}
              </ImageListItem>
            ))}
          </ImageList>
        </Box>
      )}
    </Box>
  )
}
