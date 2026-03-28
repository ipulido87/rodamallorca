import {
  ArrowBack,
  Business,
  Person,
  Save,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from '../../../shared/hooks/use-snackbar'
import {
  createCustomer,
  getCustomerById,
  updateCustomer,
} from '../services/customer-service'
import type { Customer, CustomerType } from '../types/customer'
import { getErrorMessage } from '@/shared/api'

export const CustomerForm = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { showSuccess, showError } = useSnackbar()
  const isEditMode = !!id

  const [loading, setLoading] = useState(false)
  const [loadingCustomer, setLoadingCustomer] = useState(isEditMode)
  const [formData, setFormData] = useState({
    type: 'INDIVIDUAL' as CustomerType,
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: t('customerForm.spain'),
    notes: '',
  })

  // Cargar cliente si estamos en modo edición
  useEffect(() => {
    if (isEditMode && id) {
      loadCustomer()
    }
  }, [id, isEditMode])

  const loadCustomer = async () => {
    try {
      setLoadingCustomer(true)
      const customer = await getCustomerById(id!)
      setFormData({
        type: customer.type,
        name: customer.name,
        taxId: customer.taxId || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        postalCode: customer.postalCode || '',
        country: customer.country || t('customerForm.spain'),
        notes: customer.notes || '',
      })
    } catch (error) {
      console.error('Error loading customer:', error)
      showError(t('customerForm.loadError'))
      navigate('/customers')
    } finally {
      setLoadingCustomer(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, type: e.target.value as CustomerType }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!formData.name.trim()) {
      showError(t('customerForm.nameRequired'))
      return
    }

    try {
      setLoading(true)

      if (isEditMode) {
        await updateCustomer(id!, formData)
        showSuccess(t('customerForm.updated'))
      } else {
        await createCustomer(formData)
        showSuccess(t('customerForm.created'))
      }

      navigate('/customers')
    } catch (error: unknown) {
      console.error('Error saving customer:', error)
      showError(
        getErrorMessage(error, t(isEditMode ? 'customerForm.updateError' : 'customerForm.createError'))
      )
    } finally {
      setLoading(false)
    }
  }

  if (loadingCustomer) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('customerForm.loading')}
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            mb: 4,
            gap: isMobile ? 2 : 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <IconButton
              onClick={() => navigate('/customers')}
              sx={{
                mr: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {isEditMode ? t('customerForm.editTitle') : t('customerForm.newTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode
                  ? t('customerForm.editSubtitle')
                  : t('customerForm.newSubtitle')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent>
              <Stack spacing={4}>
                {/* Tipo de Cliente */}
                <FormControl component="fieldset">
                  <FormLabel component="legend">{t('customerForm.customerType')}</FormLabel>
                  <RadioGroup
                    row
                    name="type"
                    value={formData.type}
                    onChange={handleTypeChange}
                  >
                    <FormControlLabel
                      value="INDIVIDUAL"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person />
                          <span>{t('customerForm.individual')}</span>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="BUSINESS"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business />
                          <span>{t('customerForm.business')}</span>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {/* Información Básica */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('customerForm.basicInfo')}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      required
                      label={formData.type === 'INDIVIDUAL' ? t('customerForm.fullName') : t('customerForm.companyName')}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <TextField
                      fullWidth
                      label={formData.type === 'BUSINESS' ? t('customerForm.cif') : t('customerForm.nif')}
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      placeholder={formData.type === 'BUSINESS' ? 'B12345678' : '12345678A'}
                    />
                  </Stack>
                </Box>

                {/* Información de Contacto */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('customerForm.contactInfo')}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('customerForm.emailPlaceholder')}
                    />
                    <TextField
                      fullWidth
                      label={t('customerForm.phone')}
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+34 600 000 000"
                    />
                  </Stack>
                </Box>

                {/* Dirección */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('customerForm.address')}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label={t('customerForm.address')}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder={t('customerForm.addressPlaceholder')}
                    />
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={2}>
                      <TextField
                        fullWidth
                        label={t('customerForm.city')}
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Palma de Mallorca"
                      />
                      <TextField
                        fullWidth={isMobile}
                        label={t('customerForm.postalCode')}
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="07001"
                        sx={{ width: isMobile ? '100%' : '200px' }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label={t('customerForm.country')}
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    />
                  </Stack>
                </Box>

                {/* Notas Internas */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {t('customerForm.internalNotes')}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={t('customerForm.notes')}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder={t('customerForm.notesPlaceholder')}
                  />
                </Box>

                {/* Botones de acción */}
                <Stack
                  direction={isMobile ? 'column-reverse' : 'row'}
                  spacing={2}
                  justifyContent="flex-end"
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/customers')}
                    fullWidth={isMobile}
                    disabled={loading}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    fullWidth={isMobile}
                    disabled={loading}
                  >
                    {loading
                      ? t('customerForm.saving')
                      : isEditMode
                      ? t('customerForm.updateBtn')
                      : t('customerForm.createBtn')}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </form>
      </Box>
    </Container>
  )
}
