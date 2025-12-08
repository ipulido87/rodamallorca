import {
  CheckCircle,
  HourglassEmpty,
  LocalShipping,
  Receipt,
  Settings,
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
import { useNavigate, useParams } from 'react-router-dom'
import {
  getOrderStatusColor,
  getOrderStatusLabel,
  getWorkshopOrders,
  type Order,
  OrderStatus,
  updateOrderStatus,
} from '../services/order-service'

export const WorkshopOrders = () => {
  const { workshopId } = useParams<{ workshopId: string }>()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
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

  const loadOrders = async () => {
    if (!workshopId) return

    try {
      setLoading(true)
      const data = await getWorkshopOrders(workshopId)
      setOrders(data)
    } catch {
      setError('Error al cargar los pedidos del taller')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [workshopId])

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
    } catch {
      setError('Error al actualizar el estado del pedido')
    } finally {
      setUpdateLoading(null)
    }
  }

  const handleUpdateDialogClose = () => {
    setUpdateDialog({ open: false, order: null, newStatus: null })
  }

  const formatPrice = (price: number) => `${(price / 100).toFixed(2)}€`

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <HourglassEmpty />
      case OrderStatus.CONFIRMED:
      case OrderStatus.IN_PROGRESS:
        return <Settings />
      case OrderStatus.READY:
        return <LocalShipping />
      case OrderStatus.COMPLETED:
        return <CheckCircle />
      default:
        return <Receipt />
    }
  }

  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
      [OrderStatus.IN_PROGRESS]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    }
    return transitions[currentStatus] || []
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando pedidos del taller...
          </Typography>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Pedidos del Taller
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona los pedidos recibidos en tu taller
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Lista de pedidos */}
        {orders.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Receipt sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary">
              No hay pedidos todavía
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {orders.map((order) => (
              <Card key={order.id}>
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
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        {getStatusIcon(order.status)}
                        <Typography variant="h6">
                          Pedido #{order.id.slice(0, 8)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Cliente: {order.userId.slice(0, 8)}
                      </Typography>
                    </Box>
                    <Chip
                      label={getOrderStatusLabel(order.status)}
                      color={getOrderStatusColor(order.status)}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {formatPrice(order.totalAmount)}
                    </Typography>
                  </Box>

                  {order.notes && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Notas del cliente: {order.notes}
                    </Typography>
                  )}

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      Ver Detalles
                    </Button>
                    {order.status !== OrderStatus.COMPLETED &&
                      order.status !== OrderStatus.CANCELLED && (
                        <Button
                          variant="contained"
                          startIcon={<Settings />}
                          onClick={() => handleStatusChangeClick(order)}
                        >
                          Actualizar Estado
                        </Button>
                      )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {/* Modal de actualización de estado */}
        <Dialog
          open={updateDialog.open}
          onClose={handleUpdateDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Actualizar Estado del Pedido</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={3}>
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
                {updateDialog.order &&
                  getNextStatuses(updateDialog.order.status).map((status) => (
                    <MenuItem key={status} value={status}>
                      {getOrderStatusLabel(status)}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUpdateDialogClose} disabled={updateLoading !== null}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateConfirm}
              color="primary"
              variant="contained"
              disabled={!updateDialog.newStatus || updateLoading !== null}
            >
              {updateLoading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
