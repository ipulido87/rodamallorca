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
  Switch,
  FormControlLabel,
  Collapse,
  Chip,
  Stack,
  Checkbox,
  FormGroup,
} from '@mui/material'
import { PedalBike, Inventory } from '@mui/icons-material'
import { AxiosError } from 'axios'
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ImageUpload } from '../../media/components/image-downloads'
import type { ProcessedImage } from '../../media/services/media-service'
import {
  createProduct,
  type CreateProductData,
} from '../services/product-service'
import { API } from '../../auth/services/auth-service'

interface Category {
  id: string
  name: string
}

// Extender el tipo para incluir imágenes y campos de alquiler
interface CreateProductFormData extends CreateProductData {
  images: ProcessedImage[]
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

export const CreateProduct = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const [formData, setFormData] = useState<CreateProductFormData>({
    title: '',
    price: 0,
    condition: 'used',
    status: 'DRAFT',
    description: '',
    categoryId: '',
    images: [],
    // Campos de alquiler con valores por defecto
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? checked :
        (name === 'price' || name === 'rentalPricePerDay' || name === 'rentalPricePerWeek' ||
         name === 'depositAmount' || name === 'frameSize' || name === 'availableQuantity' ||
         name === 'minRentalDays' || name === 'maxRentalDays') ? Number(value) :
        value,
    }))
  }

  const handleImagesChange = (images: ProcessedImage[]) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }))
  }

  // Cargar categorías al montar el componente
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

  // Detectar query parameter isRental=true
  useEffect(() => {
    const isRentalParam = searchParams.get('isRental')
    if (isRentalParam === 'true') {
      setFormData((prev) => ({
        ...prev,
        isRental: true,
      }))
    }
  }, [searchParams])

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
      const productData: any = {
        title: formData.title.trim(),
        price: formData.price * 100, // convertir a céntimos
        condition: formData.condition,
        status: formData.status,
        description: formData.description?.trim() || undefined,
        categoryId: formData.categoryId?.trim() || undefined,
        images: formData.images,
      }

      // Si es alquiler, agregar campos de rental
      if (formData.isRental) {
        productData.isRental = true
        productData.rentalPricePerDay = (formData.rentalPricePerDay || 0) * 100 // a céntimos
        if (formData.rentalPricePerWeek && formData.rentalPricePerWeek > 0) {
          productData.rentalPricePerWeek = formData.rentalPricePerWeek * 100
        }
        productData.availableQuantity = formData.availableQuantity || 1
        productData.bikeType = formData.bikeType || undefined
        productData.bikeSize = formData.bikeSize || undefined
        productData.bikeBrand = formData.bikeBrand?.trim() || undefined
        productData.bikeModel = formData.bikeModel?.trim() || undefined
        productData.frameSize = formData.frameSize || undefined
        productData.includesHelmet = formData.includesHelmet || false
        productData.includesLock = formData.includesLock || false
        productData.includesLights = formData.includesLights || false
        if (formData.depositAmount && formData.depositAmount > 0) {
          productData.depositAmount = formData.depositAmount * 100
        }
        productData.minRentalDays = formData.minRentalDays || 1
        productData.maxRentalDays = formData.maxRentalDays || 30
      }

      await createProduct(productData)

      setSuccess(
        formData.isRental
          ? '¡Bicicleta de alquiler creada correctamente!'
          : '¡Producto creado correctamente!'
      )
      // Navegar según el tipo: alquiler → my-rentals, producto → my-products
      setTimeout(() => {
        navigate(formData.isRental ? '/my-rentals' : '/my-products')
      }, 1500)
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
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          {formData.isRental ? (
            <PedalBike sx={{ fontSize: 40, color: 'success.main' }} />
          ) : (
            <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />
          )}
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
              {formData.isRental ? 'Crear Bicicleta de Alquiler' : 'Crear Producto'}
            </Typography>
            {formData.isRental && (
              <Chip label="Modo Alquiler" color="success" size="small" />
            )}
          </Box>
        </Stack>

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
            label={formData.isRental ? 'Precio por Día (€)' : 'Precio (€)'}
            name={formData.isRental ? 'rentalPricePerDay' : 'price'}
            type="number"
            value={formData.isRental ? formData.rentalPricePerDay : formData.price}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
            helperText={
              formData.isRental
                ? 'Precio de alquiler por día en euros'
                : 'Precio de venta en euros (ej: 299.99)'
            }
          />

          {/* Campos adicionales de alquiler */}
          <Collapse in={formData.isRental}>
            <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'success.light', borderRadius: 2, bgcolor: 'success.50' }}>
              <Typography variant="h6" gutterBottom color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PedalBike /> Configuración de Alquiler
              </Typography>

              <TextField
                label="Precio por Semana (€) - Opcional"
                name="rentalPricePerWeek"
                type="number"
                value={formData.rentalPricePerWeek}
                onChange={handleChange}
                margin="normal"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Precio especial para alquiler semanal (descuento)"
              />

              <TextField
                label="Cantidad Disponible"
                name="availableQuantity"
                type="number"
                value={formData.availableQuantity}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required={formData.isRental}
                inputProps={{ min: 1 }}
                helperText="Cuántas bicis de este tipo tienes disponibles para alquilar"
              />

              <TextField
                label="Tipo de Bicicleta"
                name="bikeType"
                value={formData.bikeType}
                onChange={handleChange}
                margin="normal"
                fullWidth
                select
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
                  name="bikeSize"
                  value={formData.bikeSize}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  select
                  helperText="Talla de cuadro"
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
                  name="frameSize"
                  type="number"
                  value={formData.frameSize}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText="Ej: 54, 56, 58"
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Marca"
                  name="bikeBrand"
                  value={formData.bikeBrand}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  placeholder="Ej: Trek, Specialized, Giant"
                />

                <TextField
                  label="Modelo"
                  name="bikeModel"
                  value={formData.bikeModel}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  placeholder="Ej: Domane SL5, Tarmac"
                />
              </Stack>

              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                Accesorios Incluidos
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includesHelmet || false}
                      onChange={handleChange}
                      name="includesHelmet"
                    />
                  }
                  label="Incluye Casco"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includesLock || false}
                      onChange={handleChange}
                      name="includesLock"
                    />
                  }
                  label="Incluye Candado"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includesLights || false}
                      onChange={handleChange}
                      name="includesLights"
                    />
                  }
                  label="Incluye Luces"
                />
              </FormGroup>

              <TextField
                label="Depósito (€) - Opcional"
                name="depositAmount"
                type="number"
                value={formData.depositAmount}
                onChange={handleChange}
                margin="normal"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Cantidad a cobrar como depósito reembolsable"
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Alquiler Mínimo (días)"
                  name="minRentalDays"
                  type="number"
                  value={formData.minRentalDays}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  inputProps={{ min: 1 }}
                  helperText="Mínimo de días"
                />

                <TextField
                  label="Alquiler Máximo (días)"
                  name="maxRentalDays"
                  type="number"
                  value={formData.maxRentalDays}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  inputProps={{ min: 1 }}
                  helperText="Máximo de días"
                />
              </Stack>
            </Box>
          </Collapse>

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

          {/* Campo de categoría (solo para productos de venta, no alquileres) */}
          {!formData.isRental && (
            <TextField
              label="Categoría"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              margin="normal"
              fullWidth
              select
              helperText="Tipo de producto que estás vendiendo"
            >
              <MenuItem value="">-- Sin categoría --</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          )}

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
                (formData.isRental
                  ? (formData.rentalPricePerDay || 0) <= 0
                  : formData.price <= 0) ||
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
