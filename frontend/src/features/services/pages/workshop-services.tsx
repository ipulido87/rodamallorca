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
import { useSnackbar } from '../../../shared/hooks/use-snackbar'
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
      const [servicesData, categoriesData] = await Promise.all([
        getWorkshopServices(workshopId),
        getServiceCategories(),
      ])
      setServices(servicesData)
      setCategories(categoriesData)
    } catch (error) {
      showError('Error al cargar los servicios')
      console.error('Error loading services:', error)
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
      showError('Por favor completa todos los campos requeridos')
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
        showSuccess('✓ Servicio actualizado correctamente')
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
        showSuccess('✓ Servicio creado correctamente')
      }

      handleCloseDialog()
      void loadData()
    } catch (error) {
      showError(
        editingService
          ? 'Error al actualizar el servicio'
          : 'Error al crear el servicio'
      )
      console.error('Error saving service:', error)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return
    }

    try {
      await deleteService(serviceId)
      showSuccess('✓ Servicio eliminado correctamente')
      void loadData()
    } catch (error) {
      showError('Error al eliminar el servicio')
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
            Cargando servicios...
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
              Servicios del Taller
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona los servicios que ofrece tu taller
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Servicio
          </Button>
        </Box>

        {/* Lista de servicios */}
        {services.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Build sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No hay servicios todavía
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Crea tu primer servicio para que los clientes puedan solicitarlo
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Crear Servicio
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
                          label={service.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
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
            {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.serviceCategoryId}
                  label="Categoría"
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
                label="Nombre del servicio"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej: Cambio de cubiertas"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe el servicio en detalle..."
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Precio"
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
                  label="Duración (minutos)"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  inputProps={{ min: 1 }}
                />
              </Box>

              <FormControl fullWidth>
                <InputLabel>Tipo de vehículo</InputLabel>
                <Select
                  value={formData.vehicleType}
                  label="Tipo de vehículo"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vehicleType: e.target.value as VehicleType,
                    })
                  }
                >
                  <MenuItem value="ALL">Todos los vehículos</MenuItem>
                  <MenuItem value="BICYCLE">Bicicleta</MenuItem>
                  <MenuItem value="E_BIKE">Bicicleta Eléctrica</MenuItem>
                  <MenuItem value="E_SCOOTER">Patinete Eléctrico</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.status}
                  label="Estado"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ServiceStatus,
                    })
                  }
                >
                  <MenuItem value="ACTIVE">Activo</MenuItem>
                  <MenuItem value="INACTIVE">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
