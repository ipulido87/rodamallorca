// pages/edit-product.tsx

import { ArrowBack, Save } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../../auth/hooks/useAuth'

interface Product {
  id: string
  title: string
  description?: string
  price: number
  status: 'PUBLISHED' | 'DRAFT'
  categoryId: string | null
  workshopId: string
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
  } | null
  images: Array<{
    id: string
    url: string
    productId: string
  }>
}

interface Category {
  id: string
  name: string
}

// Zod schema para validación del formulario
const editProductSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
})

type EditProductFormData = z.infer<typeof editProductSchema>

export const EditProduct = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Verificación de autorización temprana
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login')
        return
      }
      if (user.role !== 'WORKSHOP_OWNER') {
        navigate('/catalog') // Redirigir si no es workshop owner
        return
      }
    }
  }, [user, authLoading, navigate])

  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<EditProductFormData>({
    title: '',
    description: '',
    price: 0,
    categoryId: '',
    status: 'DRAFT',
  })

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  // Cargar categorías desde el backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/categories`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        )

        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        } else {
          console.warn('Categories endpoint not available')
          setCategories([])
        }
      } catch (err) {
        console.warn('Could not load categories:', err)
        setCategories([])
      }
    }

    loadCategories()
  }, [])

  // Cargar producto para editar
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('ID de producto no válido')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/owner/products/${id}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        )

        if (!response.ok) {
          throw new Error('Producto no encontrado')
        }

        const product: Product = await response.json()

        setFormData({
          title: product.title,
          description: product.description || '',
          price: product.price, // El precio ya viene en euros
          categoryId: product.categoryId || '',
          status: product.status,
        })
      } catch (err) {
        setError('Error al cargar el producto')
        console.error('Error loading product:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [id])

  const handleChange =
    (field: keyof EditProductFormData) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | SelectChangeEvent<string>
    ) => {
      const value =
        field === 'price' ? Number(event.target.value) : event.target.value
      setFormData((prev) => ({ ...prev, [field]: value }))

      // Limpiar errores al editar
      if (error) setError(null)
      if (success) setSuccess(false)
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: '' }))
      }
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación con Zod
    const result = editProductSchema.safeParse(formData)

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message
        }
      })
      setValidationErrors(errors)
      return
    }

    try {
      setSaving(true)
      setError(null)
      setValidationErrors({})

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/owner/products/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            title: result.data.title.trim(),
            description: result.data.description?.trim() || null,
            price: result.data.price, // Enviar precio en euros
            categoryId: result.data.categoryId || null,
            status: result.data.status,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Error al actualizar el producto')
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/my-products')
      }, 1500)
    } catch (err) {
      setError('Error al guardar el producto')
      console.error('Error updating product:', err)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error && !formData.title) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/my-products')}
        >
          Volver
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Editar Producto
        </Typography>
      </Stack>

      {/* Mensajes */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Producto actualizado correctamente. Redirigiendo...
        </Alert>
      )}

      {/* Formulario */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Título */}
              <TextField
                label="Título del producto"
                placeholder="Ej: Bicicleta Trek Fuel EX 9.8"
                value={formData.title}
                onChange={handleChange('title')}
                required
                fullWidth
                disabled={saving}
                error={!!validationErrors.title}
                helperText={validationErrors.title}
              />

              {/* Descripción */}
              <TextField
                label="Descripción"
                placeholder="Describe las características, estado, incluye..."
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={4}
                fullWidth
                disabled={saving}
                error={!!validationErrors.description}
                helperText={validationErrors.description}
              />

              {/* Precio y Categoría */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Precio (€)"
                  type="number"
                  value={formData.price || ''}
                  onChange={handleChange('price')}
                  required
                  fullWidth
                  disabled={saving}
                  inputProps={{ min: 0, step: 0.01 }}
                  error={!!validationErrors.price}
                  helperText={validationErrors.price}
                />

                <FormControl
                  fullWidth
                  disabled={saving}
                  error={!!validationErrors.categoryId}
                >
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Categoría"
                    onChange={handleChange('categoryId')}
                  >
                    <MenuItem value="">
                      <em>Sin categoría</em>
                    </MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Estado */}
              <FormControl
                fullWidth
                disabled={saving}
                error={!!validationErrors.status}
              >
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado"
                  onChange={handleChange('status')}
                >
                  <MenuItem value="DRAFT">Borrador</MenuItem>
                  <MenuItem value="PUBLISHED">Publicado</MenuItem>
                </Select>
              </FormControl>

              {/* Botones */}
              <Stack
                direction="row"
                spacing={2}
                justifyContent="flex-end"
                sx={{ mt: 4 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/my-products')}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  )
}
