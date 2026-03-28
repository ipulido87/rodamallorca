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
import { useTranslation } from 'react-i18next'
import { ImageUpload } from '../../media/components/image-downloads'
import type { ProcessedImage } from '../../media/services/media-service'
import {
  createProduct,
  type CreateProductData,
} from '../services/product-service'
import { API } from '@/shared/api'

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
  const { t } = useTranslation()
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
        const response = await API.get<Category[]>('/catalog/categories')
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
      setError(t('createProduct.imageRequired'))
      setLoading(false)
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic rental fields added conditionally
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
        // Siempre enviar depositAmount, incluso si es 0
        productData.depositAmount = (formData.depositAmount || 0) * 100
        productData.minRentalDays = formData.minRentalDays || 1
        productData.maxRentalDays = formData.maxRentalDays || 30
      }

      await createProduct(productData)

      setSuccess(
        formData.isRental
          ? t('createProduct.rentalCreated')
          : t('createProduct.productCreated')
      )
      // Navegar según el tipo: alquiler → my-rentals, producto → my-products
      setTimeout(() => {
        navigate(formData.isRental ? '/my-rentals' : '/my-products')
      }, 1500)
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || t('createProduct.createError'))
      } else {
        setError(t('createProduct.createError'))
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
              {formData.isRental ? t('createProduct.createRentalBike') : t('createProduct.createProductTitle')}
            </Typography>
            {formData.isRental && (
              <Chip label={t('createProduct.rentalMode')} color="success" size="small" />
            )}
          </Box>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('createProduct.fillInfo')}
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
            {t('createProduct.basicInfo')}
          </Typography>

          <TextField
            label={t('createProduct.productTitle')}
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            placeholder={t('createProduct.titlePlaceholder')}
          />

          <TextField
            label={formData.isRental ? t('createProduct.pricePerDay') : t('createProduct.price')}
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
                ? t('createProduct.rentalPriceHelper')
                : t('createProduct.salePriceHelper')
            }
          />

          {/* Campos adicionales de alquiler */}
          <Collapse in={formData.isRental}>
            <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'success.light', borderRadius: 2, bgcolor: 'success.50' }}>
              <Typography variant="h6" gutterBottom color="success.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PedalBike /> {t('createProduct.rentalConfig')}
              </Typography>

              <TextField
                label={t('createProduct.weeklyPrice')}
                name="rentalPricePerWeek"
                type="number"
                value={formData.rentalPricePerWeek}
                onChange={handleChange}
                margin="normal"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                helperText={t('createProduct.weeklyPriceHelper')}
              />

              <TextField
                label={t('createProduct.availableQuantity')}
                name="availableQuantity"
                type="number"
                value={formData.availableQuantity}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required={formData.isRental}
                inputProps={{ min: 1 }}
                helperText={t('createProduct.availableQuantityHelper')}
              />

              <TextField
                label={t('createProduct.bikeType')}
                name="bikeType"
                value={formData.bikeType}
                onChange={handleChange}
                margin="normal"
                fullWidth
                select
                helperText={t('createProduct.bikeTypeHelper')}
              >
                <MenuItem value="">{t('createProduct.select')}</MenuItem>
                <MenuItem value="road">{t('createProduct.road')}</MenuItem>
                <MenuItem value="mountain">{t('createProduct.mountain')}</MenuItem>
                <MenuItem value="hybrid">{t('createProduct.hybrid')}</MenuItem>
                <MenuItem value="ebike">{t('createProduct.ebike')}</MenuItem>
                <MenuItem value="gravel">{t('createProduct.gravel')}</MenuItem>
                <MenuItem value="city">{t('createProduct.city')}</MenuItem>
              </TextField>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label={t('createProduct.size')}
                  name="bikeSize"
                  value={formData.bikeSize}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  select
                  helperText={t('createProduct.frameSizeHelper')}
                >
                  <MenuItem value="">{t('createProduct.select')}</MenuItem>
                  <MenuItem value="XS">XS</MenuItem>
                  <MenuItem value="S">S</MenuItem>
                  <MenuItem value="M">M</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                  <MenuItem value="XL">XL</MenuItem>
                  <MenuItem value="XXL">XXL</MenuItem>
                </TextField>

                <TextField
                  label={t('createProduct.frameSize')}
                  name="frameSize"
                  type="number"
                  value={formData.frameSize}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  inputProps={{ min: 0 }}
                  helperText={t('createProduct.frameSizeExample')}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label={t('createProduct.brand')}
                  name="bikeBrand"
                  value={formData.bikeBrand}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  placeholder={t('createProduct.brandPlaceholder')}
                />

                <TextField
                  label={t('createProduct.model')}
                  name="bikeModel"
                  value={formData.bikeModel}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  placeholder={t('createProduct.modelPlaceholder')}
                />
              </Stack>

              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
                {t('createProduct.includedAccessories')}
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
                  label={t('createProduct.includesHelmet')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includesLock || false}
                      onChange={handleChange}
                      name="includesLock"
                    />
                  }
                  label={t('createProduct.includesLock')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.includesLights || false}
                      onChange={handleChange}
                      name="includesLights"
                    />
                  }
                  label={t('createProduct.includesLights')}
                />
              </FormGroup>

              <TextField
                label={t('createProduct.deposit')}
                name="depositAmount"
                type="number"
                value={formData.depositAmount}
                onChange={handleChange}
                margin="normal"
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                helperText={t('createProduct.depositHelper')}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label={t('createProduct.minRentalDays')}
                  name="minRentalDays"
                  type="number"
                  value={formData.minRentalDays}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  inputProps={{ min: 1 }}
                  helperText={t('createProduct.minDaysHelper')}
                />

                <TextField
                  label={t('createProduct.maxRentalDays')}
                  name="maxRentalDays"
                  type="number"
                  value={formData.maxRentalDays}
                  onChange={handleChange}
                  margin="normal"
                  fullWidth
                  inputProps={{ min: 1 }}
                  helperText={t('createProduct.maxDaysHelper')}
                />
              </Stack>
            </Box>
          </Collapse>

          <TextField
            label={t('createProduct.condition')}
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            select
            helperText={t('createProduct.conditionHelper')}
          >
            <MenuItem value="new">{t('common.new')}</MenuItem>
            <MenuItem value="used">{t('common.used')}</MenuItem>
            <MenuItem value="refurb">{t('common.refurbished')}</MenuItem>
          </TextField>

          <TextField
            label={t('createProduct.publishStatus')}
            name="status"
            value={formData.status}
            onChange={handleChange}
            margin="normal"
            required
            fullWidth
            select
            helperText={t('createProduct.publishStatusHelper')}
          >
            <MenuItem value="DRAFT">{t('createProduct.draft')}</MenuItem>
            <MenuItem value="PUBLISHED">{t('createProduct.published')}</MenuItem>
          </TextField>

          {/* Campo de categoría (solo para productos de venta, no alquileres) */}
          {!formData.isRental && (
            <TextField
              label={t('createProduct.category')}
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              margin="normal"
              fullWidth
              select
              helperText={t('createProduct.categoryHelper')}
            >
              <MenuItem value="">{t('createProduct.noCategory')}</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label={t('createProduct.description')}
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            fullWidth
            multiline
            rows={4}
            placeholder={t('createProduct.descriptionPlaceholder')}
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
                  ? !formData.rentalPricePerDay || formData.rentalPricePerDay <= 0
                  : formData.price <= 0) ||
                formData.images.length === 0
              }
              size="large"
            >
              {loading
                ? (formData.isRental ? t('createProduct.creatingBike') : t('createProduct.creatingProduct'))
                : (formData.isRental ? t('createProduct.createBike') : t('createProduct.createProduct'))
              }
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate(formData.isRental ? '/my-rentals' : '/my-products')}
              disabled={loading}
              size="large"
            >
              {t('common.cancel')}
            </Button>
          </Box>

          {/* Información adicional */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: 'block' }}
          >
            {t('createProduct.imageProcessingNote')}
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}
