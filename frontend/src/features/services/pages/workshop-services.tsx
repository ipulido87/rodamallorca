import {
  Add,
  Delete,
  Edit,
  Build,
  DirectionsBike,
  ElectricBike,
  ElectricScooter,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSnackbar } from '../../../shared/hooks/use-snackbar'
import { confirmDialog } from '../../../shared/services/confirm-service'
import {
  createService,
  deleteService,
  formatDuration,
  formatPrice,
  getServiceCategories,
  getVehicleTypeLabel,
  getWorkshopServices,
  ServiceStatus,
  updateService,
  VehicleType,
  type Service,
  type ServiceCategory,
} from '../services/service-service'

export const WorkshopServices = () => {
  const { t } = useTranslation()
  const { workshopId } = useParams<{ workshopId: string }>()
  const { showSuccess, showError } = useSnackbar()

  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    serviceCategoryId: '',
    name: '',
    description: '',
    price: '',
    duration: '',
    vehicleType: 'ALL' as VehicleType,
    status: 'ACTIVE' as ServiceStatus,
  })

  const loadData = useCallback(async () => {
    if (!workshopId) return

    try {
      setLoading(true)

      // Cargar categorías siempre (no depende de servicios)
      const categoriesData = await getServiceCategories()
      setCategories(categoriesData)

      // Cargar servicios (puede fallar sin afectar categorías)
      try {
        const servicesData = await getWorkshopServices(workshopId)
        setServices(servicesData)
      } catch (servicesError) {
        console.error('Error loading workshop services:', servicesError)
        setServices([]) // Dejar vacío si falla
        // No mostrar error si es solo problema de servicios
      }
    } catch (error) {
      showError(t('services.loadCategoriesError'))
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshopId]) // ✅ Quitar showError de dependencias para evitar loop infinito

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        serviceCategoryId: service.serviceCategoryId,
        name: service.name,
        description: service.description || '',
        price: (service.price / 100).toString(),
        duration: service.duration?.toString() || '',
        vehicleType: service.vehicleType,
        status: service.status,
      })
    } else {
      setEditingService(null)
      setFormData({
        serviceCategoryId: '',
        name: '',
        description: '',
        price: '',
        duration: '',
        vehicleType: 'ALL',
        status: 'ACTIVE',
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingService(null)
  }

  const handleSubmit = async () => {
    if (!workshopId) return

    if (!formData.name || !formData.serviceCategoryId || !formData.price) {
      showError(t('services.fillRequiredFields'))
      return
    }

    try {
      const priceInCents = Math.round(parseFloat(formData.price) * 100)
      const duration = formData.duration ? parseInt(formData.duration) : undefined

      if (editingService) {
        // Actualizar
        await updateService(editingService.id, {
          name: formData.name,
          description: formData.description || undefined,
          price: priceInCents,
          duration,
          vehicleType: formData.vehicleType,
          status: formData.status,
          serviceCategoryId: formData.serviceCategoryId,
        })
        showSuccess(t('services.serviceUpdated'))
      } else {
        // Crear nuevo
        await createService({
          workshopId,
          serviceCategoryId: formData.serviceCategoryId,
          name: formData.name,
          description: formData.description || undefined,
          price: priceInCents,
          duration,
          vehicleType: formData.vehicleType,
          status: formData.status,
        })
        showSuccess(t('services.serviceCreated'))
      }

      handleCloseDialog()
      void loadData()
    } catch (error) {
      showError(
        editingService
          ? t('services.updateError')
          : t('services.createError')
      )
      console.error('Error saving service:', error)
    }
  }

  const handleDelete = async (serviceId: string) => {
    const confirmed = await confirmDialog.delete('este servicio')
    if (!confirmed) return

    try {
      await deleteService(serviceId)
      showSuccess(t('services.serviceDeleted'))
      void loadData()
    } catch (error) {
      showError(t('services.deleteError'))
      console.error('Error deleting service:', error)
    }
  }

  const getVehicleTypeIcon = (type: VehicleType) => {
    switch (type) {
      case 'BICYCLE':
        return <DirectionsBike fontSize="small" />
      case 'E_BIKE':
        return <ElectricBike fontSize="small" />
      case 'E_SCOOTER':
        return <ElectricScooter fontSize="small" />
      default:
        return <Build fontSize="small" />
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {t('services.loadingServices')}
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {t('services.workshopServices')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('services.manageServices')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            {t('services.newService')}
          </Button>
        </Box>

        {/* Lista de servicios */}
        {services.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Build sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {t('services.noServicesYet')}
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              {t('services.createFirstService')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              {t('services.createService')}
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {service.name}
                      </Typography>

                      {service.description && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {service.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip
                          label={service.serviceCategory?.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={getVehicleTypeIcon(service.vehicleType)}
                          label={getVehicleTypeLabel(service.vehicleType)}
                          size="small"
                        />
                        {service.duration && (
                          <Chip
                            label={formatDuration(service.duration)}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        <Chip
                          label={service.status === 'ACTIVE' ? t('services.active') : t('services.inactive')}
                          size="small"
                          color={service.status === 'ACTIVE' ? 'success' : 'default'}
                        />
                      </Box>

                      <Typography variant="h5" fontWeight="bold" color="primary">
                        {formatPrice(service.price)}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(service)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {/* Dialog para crear/editar servicio */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingService ? t('services.editService') : t('services.newService')}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>{t('services.category')}</InputLabel>
                <Select
                  value={formData.serviceCategoryId}
                  label={t('services.category')}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceCategoryId: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                required
                label={t('services.serviceName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('services.serviceNamePlaceholder')}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('services.description')}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t('services.descriptionPlaceholder')}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label={t('services.price')}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">€</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />

                <TextField
                  fullWidth
                  type="number"
                  label={t('services.durationMinutes')}
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  inputProps={{ min: 1 }}
                />
              </Box>

              <FormControl fullWidth>
                <InputLabel>{t('services.vehicleType')}</InputLabel>
                <Select
                  value={formData.vehicleType}
                  label={t('services.vehicleType')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleType: e.target.value as VehicleType,
                    })
                  }
                >
                  <MenuItem value="ALL">{t('common.allVehicles')}</MenuItem>
                  <MenuItem value="BICYCLE">{t('common.bicycle')}</MenuItem>
                  <MenuItem value="E_BIKE">{t('common.eBike')}</MenuItem>
                  <MenuItem value="E_SCOOTER">{t('common.eScooter')}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>{t('common.status')}</InputLabel>
                <Select
                  value={formData.status}
                  label={t('common.status')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ServiceStatus,
                    })
                  }
                >
                  <MenuItem value="ACTIVE">{t('services.active')}</MenuItem>
                  <MenuItem value="INACTIVE">{t('services.inactive')}</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingService ? t('common.saveChanges') : t('services.createService')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
