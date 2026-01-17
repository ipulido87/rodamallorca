// pages/edit-product.tsx

import { ArrowBack, Save, PedalBike, Inventory } from '@mui/icons-material'
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
  Stack,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Collapse,
  Chip,
  Checkbox,
  FormGroup,
  Paper,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../../auth/hooks/useAuth'
import { API } from '../../auth/services/auth-service'

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
  // Campos de alquiler
  isRental?: boolean
  rentalPricePerDay?: number
  rentalPricePerWeek?: number
  availableQuantity?: number
  bikeType?: string
  bikeSize?: string
  bikeBrand?: string
  bikeModel?: string
  frameSize?: number
  includesHelmet?: boolean
  includesLock?: boolean
  includesLights?: boolean
  depositAmount?: number
  minRentalDays?: number
  maxRentalDays?: number
}

interface Category {
  id: string
  name: string
}

// Zod schema para validación del formulario
const editProductSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0').optional(),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  // Campos de alquiler
  isRental: z.boolean().optional(),
  rentalPricePerDay: z.number().min(0).optional(),
  rentalPricePerWeek: z.number().min(0).optional(),
  availableQuantity: z.number().min(1).optional(),
  bikeType: z.string().optional(),
  bikeSize: z.string().optional(),
  bikeBrand: z.string().optional(),
  bikeModel: z.string().optional(),
  frameSize: z.number().optional(),
  includesHelmet: z.boolean().optional(),
  includesLock: z.boolean().optional(),
  includesLights: z.boolean().optional(),
  depositAmount: z.number().min(0).optional(),
  minRentalDays: z.number().min(1).optional(),
  maxRentalDays: z.number().min(1).optional(),
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
    // Campos de alquiler
    isRental: false,
    rentalPricePerDay: 0,
    rentalPricePerWeek: 0,
    availableQuantity: 1,
    bikeType: '',
    bikeSize: '',
    bikeBrand: '',
    bikeModel: '',
    frameSize: 0,
    includesHelmet: false,
    includesLock: false,
    includesLights: false,
    depositAmount: 0,
    minRentalDays: 1,
    maxRentalDays: 30,
  })

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({})

  // Cargar categorías desde el backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await API.get<Category[]>('/categories')
        setCategories(response.data)
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
        const response = await API.get<Product>(`/owner/products/${id}`)
        const product = response.data

        setFormData({
          title: product.title,
          description: product.description || '',
          price: product.price, // El precio ya viene en euros
          categoryId: product.categoryId || '',
          status: product.status,
          // Campos de alquiler
          isRental: product.isRental || false,
          rentalPricePerDay: product.rentalPricePerDay || 0,
          rentalPricePerWeek: product.rentalPricePerWeek || 0,
          availableQuantity: product.availableQuantity || 1,
          bikeType: product.bikeType || '',
          bikeSize: product.bikeSize || '',
          bikeBrand: product.bikeBrand || '',
          bikeModel: product.bikeModel || '',
          frameSize: product.frameSize || 0,
          includesHelmet: product.includesHelmet || false,
          includesLock: product.includesLock || false,
          includesLights: product.includesLights || false,
          depositAmount: product.depositAmount || 0,
          minRentalDays: product.minRentalDays || 1,
          maxRentalDays: product.maxRentalDays || 30,
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
      const target = event.target as HTMLInputElement
      const value =
        target.type === 'checkbox'
          ? target.checked
          : (field === 'price' ||
              field === 'rentalPricePerDay' ||
              field === 'rentalPricePerWeek' ||
              field === 'depositAmount' ||
              field === 'frameSize' ||
              field === 'availableQuantity' ||
              field === 'minRentalDays' ||
              field === 'maxRentalDays')
            ? Number(target.value)
            : target.value
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

      const updateData: any = {
        title: result.data.title.trim(),
        description: result.data.description?.trim() || null,
        price: result.data.price, // Enviar precio en euros
        categoryId: result.data.categoryId || null,
        status: result.data.status,
      }

      // Si es alquiler, agregar campos de rental
      if (result.data.isRental) {
        updateData.isRental = true
        updateData.rentalPricePerDay = result.data.rentalPricePerDay || 0
        if (result.data.rentalPricePerWeek && result.data.rentalPricePerWeek > 0) {
          updateData.rentalPricePerWeek = result.data.rentalPricePerWeek
        }
        updateData.availableQuantity = result.data.availableQuantity || 1
        updateData.bikeType = result.data.bikeType || undefined
        updateData.bikeSize = result.data.bikeSize || undefined
        updateData.bikeBrand = result.data.bikeBrand?.trim() || undefined
        updateData.bikeModel = result.data.bikeModel?.trim() || undefined
        updateData.frameSize = result.data.frameSize || undefined
        updateData.includesHelmet = result.data.includesHelmet || false
        updateData.includesLock = result.data.includesLock || false
        updateData.includesLights = result.data.includesLights || false
        if (result.data.depositAmount && result.data.depositAmount > 0) {
          updateData.depositAmount = result.data.depositAmount
        }
        updateData.minRentalDays = result.data.minRentalDays || 1
        updateData.maxRentalDays = result.data.maxRentalDays || 30
      } else {
        // Si NO es alquiler, asegurarse de limpiar los campos
        updateData.isRental = false
      }

      await API.put(`/owner/products/${id}`, updateData)

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
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {formData.isRental ? (
              <PedalBike sx={{ fontSize: 32, color: 'success.main' }} />
            ) : (
              <Inventory sx={{ fontSize: 32, color: 'primary.main' }} />
            )}
            <Typography variant="h4" fontWeight="bold">
              {formData.isRental ? 'Editar Bicicleta de Alquiler' : 'Editar Producto'}
            </Typography>
            {formData.isRental && (
              <Chip label="Alquiler" color="success" size="small" />
            )}
          </Stack>
        </Box>
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
            {/* Toggle Alquiler vs Venta */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRental || false}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isRental: e.target.checked }))
                    }
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle1" fontWeight="600">
                      ¿Es para alquiler?
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.isRental
                        ? 'Configurando como bicicleta de alquiler'
                        : 'Configurando como producto para venta'}
                    </Typography>
                  </Box>
                }
              />
            </Paper>

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

              {/* Campos de Precio - condicional según modo */}
              <TextField
                label={formData.isRental ? 'Precio por Día (€)' : 'Precio (€)'}
                type="number"
                value={formData.isRental ? formData.rentalPricePerDay : formData.price}
                onChange={handleChange(formData.isRental ? 'rentalPricePerDay' : 'price')}
                required
                fullWidth
                disabled={saving}
                inputProps={{ min: 0, step: 0.01 }}
                helperText={
                  formData.isRental
                    ? 'Precio de alquiler por día en euros'
                    : 'Precio de venta en euros'
                }
              />

              {/* Campos adicionales de alquiler */}
              <Collapse in={formData.isRental}>
                <Paper sx={{ p: 3, border: '1px solid', borderColor: 'success.light', borderRadius: 2, bgcolor: 'success.50' }}>
                  <Typography variant="h6" gutterBottom color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PedalBike /> Configuración de Alquiler
                  </Typography>

                  <Stack spacing={2}>
                    <TextField
                      label="Precio por Semana (€) - Opcional"
                      type="number"
                      value={formData.rentalPricePerWeek}
                      onChange={handleChange('rentalPricePerWeek')}
                      fullWidth
                      disabled={saving}
                      inputProps={{ min: 0, step: 0.01 }}
                      helperText="Precio especial para alquiler semanal (descuento)"
                    />

                    <TextField
                      label="Cantidad Disponible"
                      type="number"
                      value={formData.availableQuantity}
                      onChange={handleChange('availableQuantity')}
                      fullWidth
                      required={formData.isRental}
                      disabled={saving}
                      inputProps={{ min: 1 }}
                      helperText="Cuántas bicis de este tipo tienes disponibles"
                    />

                    <TextField
                      label="Tipo de Bicicleta"
                      select
                      value={formData.bikeType}
                      onChange={handleChange('bikeType')}
                      fullWidth
                      disabled={saving}
                      helperText="Categoría de la bicicleta"
                    >
                      <MenuItem value="">-- Seleccionar --</MenuItem>
                      <MenuItem value="road">Carretera (Road)</MenuItem>
                      <MenuItem value="mountain">Montaña (MTB)</MenuItem>
                      <MenuItem value="hybrid">Híbrida</MenuItem>
                      <MenuItem value="ebike">Eléctrica (E-bike)</MenuItem>
                      <MenuItem value="gravel">Gravel</MenuItem>
                      <MenuItem value="city">Ciudad</MenuItem>
                    </TextField>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Talla"
                        select
                        value={formData.bikeSize}
                        onChange={handleChange('bikeSize')}
                        fullWidth
                        disabled={saving}
                      >
                        <MenuItem value="">-- Seleccionar --</MenuItem>
                        <MenuItem value="XS">XS</MenuItem>
                        <MenuItem value="S">S</MenuItem>
                        <MenuItem value="M">M</MenuItem>
                        <MenuItem value="L">L</MenuItem>
                        <MenuItem value="XL">XL</MenuItem>
                        <MenuItem value="XXL">XXL</MenuItem>
                      </TextField>

                      <TextField
                        label="Tamaño Cuadro (cm)"
                        type="number"
                        value={formData.frameSize}
                        onChange={handleChange('frameSize')}
                        fullWidth
                        disabled={saving}
                        inputProps={{ min: 0 }}
                      />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Marca"
                        value={formData.bikeBrand}
                        onChange={handleChange('bikeBrand')}
                        fullWidth
                        disabled={saving}
                        placeholder="Ej: Trek, Specialized"
                      />

                      <TextField
                        label="Modelo"
                        value={formData.bikeModel}
                        onChange={handleChange('bikeModel')}
                        fullWidth
                        disabled={saving}
                        placeholder="Ej: Domane SL5"
                      />
                    </Stack>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Accesorios Incluidos
                      </Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.includesHelmet || false}
                              onChange={handleChange('includesHelmet')}
                              disabled={saving}
                            />
                          }
                          label="Incluye Casco"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.includesLock || false}
                              onChange={handleChange('includesLock')}
                              disabled={saving}
                            />
                          }
                          label="Incluye Candado"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.includesLights || false}
                              onChange={handleChange('includesLights')}
                              disabled={saving}
                            />
                          }
                          label="Incluye Luces"
                        />
                      </FormGroup>
                    </Box>

                    <TextField
                      label="Depósito (€) - Opcional"
                      type="number"
                      value={formData.depositAmount}
                      onChange={handleChange('depositAmount')}
                      fullWidth
                      disabled={saving}
                      inputProps={{ min: 0, step: 0.01 }}
                      helperText="Cantidad a cobrar como depósito reembolsable"
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Alquiler Mínimo (días)"
                        type="number"
                        value={formData.minRentalDays}
                        onChange={handleChange('minRentalDays')}
                        fullWidth
                        disabled={saving}
                        inputProps={{ min: 1 }}
                      />

                      <TextField
                        label="Alquiler Máximo (días)"
                        type="number"
                        value={formData.maxRentalDays}
                        onChange={handleChange('maxRentalDays')}
                        fullWidth
                        disabled={saving}
                        inputProps={{ min: 1 }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              </Collapse>

              {/* Categoría */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>

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
