import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import { AxiosError } from 'axios'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImageUpload } from '../../media/components/image-downloads'
import { ProcessedImage } from '../../media/services/media-service'
import {
  createProduct,
  type CreateProductData,
} from '../services/product-service'

// Extender el tipo para incluir imágenes
interface CreateProductFormData extends CreateProductData {
  images: ProcessedImage[]
}

export const CreateProduct = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<CreateProductFormData>({
    title: '',
    price: 0,
    condition: 'used',
    status: 'DRAFT',
    description: '',
    categoryId: '',
    images: [], // Nuevo campo para imágenes
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }))
  }

  const handleImagesChange = (images: ProcessedImage[]) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validar que tenga al menos una imagen
    if (formData.images.length === 0) {
      setError('Debes subir al menos una imagen del producto')
      setLoading(false)
      return
    }

    try {
      await createProduct({
        title: formData.title.trim(),
        price: formData.price * 100, // convertir a céntimos
        condition: formData.condition,
        status: formData.status,
        description: formData.description?.trim() || undefined,
        categoryId: formData.categoryId?.trim() || undefined,
        images: formData.images, // Incluir las imágenes
      })

      setSuccess('Producto creado correctamente!')
      setTimeout(() => navigate('/my-products'), 1500)
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Error al crear el producto')
      } else {
        setError('Error al crear el producto')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Crear Producto
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Completa la información de tu producto para agregarlo al catálogo
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Información básica */}
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Información básica
          </Typography>

          <TextField
            label="Título del producto"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            placeholder="Ej: Bicicleta de montaña Trek"
          />

          <TextField
            label="Precio (€)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
            helperText="Precio en euros (ej: 299.99)"
          />

          <TextField
            label="Condición"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            select
            helperText="Estado actual del producto"
          >
            <MenuItem value="new">Nuevo</MenuItem>
            <MenuItem value="used">Usado</MenuItem>
            <MenuItem value="refurb">Reacondicionado</MenuItem>
          </TextField>

          <TextField
            label="Estado de publicación"
            name="status"
            value={formData.status}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            select
            helperText="DRAFT: Solo tú lo ves | PUBLISHED: Visible en el catálogo"
          >
            <MenuItem value="DRAFT">Borrador</MenuItem>
            <MenuItem value="PUBLISHED">Publicado</MenuItem>
          </TextField>

          <TextField
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            fullWidth
            multiline
            rows={4}
            placeholder="Describe las características, estado, accesorios incluidos, etc."
          />

          <Divider sx={{ my: 3 }} />

          {/* Upload de imágenes */}
          <ImageUpload
            maxImages={5}
            currentImages={formData.images}
            onImagesChange={handleImagesChange}
            disabled={loading}
          />

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={
                loading ||
                !formData.title.trim() ||
                formData.price <= 0 ||
                formData.images.length === 0
              }
              size="large"
            >
              {loading ? 'Creando producto...' : 'Crear Producto'}
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/my-products')}
              disabled={loading}
              size="large"
            >
              Cancelar
            </Button>
          </Box>

          {/* Información adicional */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: 'block' }}
          >
            Al crear el producto, las imágenes se procesarán automáticamente en
            diferentes tamaños para optimizar la carga en web y móvil.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}
