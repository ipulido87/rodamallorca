import {
  CheckCircle,
  HourglassEmpty,
  LocalShipping,
  Receipt,
  Settings,
  Store,
  Visibility,
} from '@mui/icons-material'
import {
  Alert,
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
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Workshop } from '../../workshops/services/workshop-service'
import { getMyWorkshops } from '../../workshops/services/workshop-service'
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  getWorkshopOrders,
  type Order,
  OrderStatus,
  updateOrderStatus,
} from '../services/order-service'

export const Orders = () => {
  const navigate = useNavigate()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [error, setError] = useState('')
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)

  // Estado para el modal de actualización de estado
  const [updateDialog, setUpdateDialog] = useState<{
    open: boolean
    order: Order | null
    newStatus: OrderStatus | null
  }>({
    open: false,
    order: null,
    newStatus: null,
  })

  // Cargar talleres del owner
  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        setLoading(true)
        const data = await getMyWorkshops()
        setWorkshops(data)

        // Si solo tiene un taller, seleccionarlo automáticamente
        if (data.length === 1) {
          setSelectedWorkshopId(data[0].id)
        }
      } catch (err) {
        setError('Error al cargar tus talleres')
      } finally {
        setLoading(false)
      }
    }

    loadWorkshops()
  }, [])

  // Cargar pedidos cuando se selecciona un taller
  useEffect(() => {
    if (!selectedWorkshopId) return

    const loadOrders = async () => {
      try {
        setOrdersLoading(true)
        const data = await getWorkshopOrders(selectedWorkshopId)
        setOrders(data)
        setError('')
      } catch (err) {
        setError('Error al cargar los pedidos del taller')
      } finally {
        setOrdersLoading(false)
      }
    }

    loadOrders()
  }, [selectedWorkshopId])

  const handleStatusChangeClick = (order: Order) => {
    setUpdateDialog({ open: true, order, newStatus: null })
  }

  const handleUpdateConfirm = async () => {
    if (!updateDialog.order || !updateDialog.newStatus) return

    try {
      setUpdateLoading(updateDialog.order.id)
      await updateOrderStatus(updateDialog.order.id, {
        status: updateDialog.newStatus,
      })

      // Actualizar la lista local
      setOrders((prev) =>
        prev.map((o) =>
          o.id === updateDialog.order?.id
            ? { ...o, status: updateDialog.newStatus! }
            : o
        )
      )

      setUpdateDialog({ open: false, order: null, newStatus: null })
    } catch (err) {
      setError('Error al actualizar el estado del pedido')
    } finally {
      setUpdateLoading(null)
    }
  }

  const formatPrice = (price: number) => {
    return `${(price / 100).toFixed(2)}€`
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return <HourglassEmpty />
      case 'CONFIRMED':
        return <CheckCircle />
      case 'IN_PROGRESS':
        return <Settings />
      case 'READY':
        return <LocalShipping />
      case 'COMPLETED':
        return <Receipt />
      default:
        return <HourglassEmpty />
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando talleres...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (workshops.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Store sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            No tienes talleres registrados
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Necesitas crear un taller para poder ver pedidos
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/create-workshop')}
            sx={{ mt: 2 }}
          >
            Crear Taller
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4">Pedidos del Taller</Typography>
        </Box>

        {/* Selector de taller (si tiene múltiples) */}
        {workshops.length > 1 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>Selecciona un taller</InputLabel>
                <Select
                  value={selectedWorkshopId}
                  label="Selecciona un taller"
                  onChange={(e) => setSelectedWorkshopId(e.target.value)}
                >
                  {workshops.map((workshop) => (
                    <MenuItem key={workshop.id} value={workshop.id}>
                      {workshop.name}
                      {workshop.city && ` - ${workshop.city}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        )}

        {/* Mostrar nombre del taller si solo tiene uno */}
        {workshops.length === 1 && (
          <Card sx={{ mb: 3, bgcolor: 'primary.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Store />
                <Typography variant="h6">{workshops[0].name}</Typography>
                {workshops[0].city && (
                  <Typography variant="body2" color="text.secondary">
                    - {workshops[0].city}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Lista de pedidos */}
        {ordersLoading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Cargando pedidos...
            </Typography>
          </Box>
        )}

        {!ordersLoading && selectedWorkshopId && orders.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Receipt sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No hay pedidos aún
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Los pedidos de tus clientes aparecerán aquí
            </Typography>
          </Box>
        )}

        {!ordersLoading && orders.length > 0 && (
          <Stack spacing={2}>
            {orders.map((order) => (
              <Card key={order.id} sx={{ position: 'relative' }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Pedido #{order.id.slice(0, 8)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(order.status)}
                      label={getOrderStatusLabel(order.status)}
                      color={getOrderStatusColor(order.status)}
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Cliente: {order.user?.email || 'N/A'}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      Total: {formatPrice(order.totalAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.items?.length || 0} producto(s)
                    </Typography>
                  </Box>

                  {order.notes && (
                    <Box
                      sx={{
                        bgcolor: 'grey.100',
                        p: 1.5,
                        borderRadius: 1,
                        mb: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Notas del cliente:
                      </Typography>
                      <Typography variant="body2">{order.notes}</Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      Ver Detalles
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Settings />}
                      onClick={() => handleStatusChangeClick(order)}
                      disabled={order.status === 'COMPLETED'}
                    >
                      Cambiar Estado
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Dialog para actualizar estado */}
      <Dialog
        open={updateDialog.open}
        onClose={() =>
          setUpdateDialog({ open: false, order: null, newStatus: null })
        }
      >
        <DialogTitle>Actualizar Estado del Pedido</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pedido #{updateDialog.order?.id.slice(0, 8)}
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Nuevo Estado</InputLabel>
            <Select
              value={updateDialog.newStatus || ''}
              label="Nuevo Estado"
              onChange={(e) =>
                setUpdateDialog((prev) => ({
                  ...prev,
                  newStatus: e.target.value as OrderStatus,
                }))
              }
            >
              <MenuItem value="PENDING">Pendiente</MenuItem>
              <MenuItem value="CONFIRMED">Confirmado</MenuItem>
              <MenuItem value="IN_PROGRESS">En Proceso</MenuItem>
              <MenuItem value="READY">Listo</MenuItem>
              <MenuItem value="COMPLETED">Completado</MenuItem>
              <MenuItem value="CANCELLED">Cancelado</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setUpdateDialog({ open: false, order: null, newStatus: null })
            }
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpdateConfirm}
            variant="contained"
            disabled={!updateDialog.newStatus || !!updateLoading}
          >
            {updateLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
