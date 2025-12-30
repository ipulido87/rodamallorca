import {
  ArrowBack,
  Business,
  Person,
  Save,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
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
import { useSnackbar } from '../../../shared/hooks/use-snackbar'
import {
  createCustomer,
  getCustomerById,
  updateCustomer,
} from '../services/customer-service'
import type { Customer, CustomerType } from '../types/customer'

export const CustomerForm = () => {
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
    country: 'España',
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
        country: customer.country || 'España',
        notes: customer.notes || '',
      })
    } catch (error) {
      console.error('Error loading customer:', error)
      showError('Error al cargar el cliente')
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
      showError('El nombre es obligatorio')
      return
    }

    try {
      setLoading(true)

      if (isEditMode) {
        await updateCustomer(id!, formData)
        showSuccess('Cliente actualizado correctamente')
      } else {
        await createCustomer(formData)
        showSuccess('Cliente creado correctamente')
      }

      navigate('/customers')
    } catch (error: any) {
      console.error('Error saving customer:', error)
      showError(
        error.response?.data?.message ||
          `Error al ${isEditMode ? 'actualizar' : 'crear'} el cliente`
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
            Cargando cliente...
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
                {isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditMode
                  ? 'Actualiza la información del cliente'
                  : 'Completa los datos para crear un nuevo cliente'}
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
                  <FormLabel component="legend">Tipo de Cliente</FormLabel>
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
                          <span>Particular</span>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="BUSINESS"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business />
                          <span>Empresa</span>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>

                {/* Información Básica */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Información Básica
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={formData.type === 'BUSINESS' ? 6 : 12}>
                      <TextField
                        fullWidth
                        required
                        label={formData.type === 'INDIVIDUAL' ? 'Nombre completo' : 'Razón social'}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </Grid>
                    {formData.type === 'BUSINESS' && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="CIF"
                          name="taxId"
                          value={formData.taxId}
                          onChange={handleChange}
                          placeholder="B12345678"
                        />
                      </Grid>
                    )}
                    {formData.type === 'INDIVIDUAL' && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="NIF/NIE"
                          name="taxId"
                          value={formData.taxId}
                          onChange={handleChange}
                          placeholder="12345678A"
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>

                {/* Información de Contacto */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Información de Contacto
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="cliente@ejemplo.com"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Teléfono"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+34 600 000 000"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Dirección */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Dirección
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Dirección"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Calle, número, piso, puerta"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Ciudad"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Palma de Mallorca"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Código Postal"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="07001"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="País"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Notas Internas */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Notas Internas
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notas"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Información adicional sobre el cliente (solo visible internamente)"
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
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    fullWidth={isMobile}
                    disabled={loading}
                  >
                    {loading
                      ? 'Guardando...'
                      : isEditMode
                      ? 'Actualizar Cliente'
                      : 'Crear Cliente'}
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
