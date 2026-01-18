import {
  CheckCircle,
  HourglassEmpty,
  LocalShipping,
  Receipt,
  Settings,
  Visibility,
  TwoWheeler,
  CalendarMonth,
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
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { useSnackbar } from '../../../shared/hooks/use-snackbar'
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
  const { showSuccess, showError } = useSnackbar()
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

  // SWR: Cargar pedidos del taller con cache
  const { data: orders = [], isLoading: loading, mutate } = useSWR<Order[]>(
    workshopId ? `/workshops/${workshopId}/orders` : null,
    () => getWorkshopOrders(workshopId!),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  const handleStatusChangeClick = (order: Order) => {
    setUpdateDialog({ open: true, order, newStatus: null })
  }

  const handleUpdateConfirm = async () => {
    if (!updateDialog.order || !updateDialog.newStatus) return

    try {
      setUpdateLoading(updateDialog.order.id)
      setError('') // Limpiar errores previos

      await updateOrderStatus(updateDialog.order.id, {
        status: updateDialog.newStatus,
      })

      // Optimistic update: actualizar cache inmediatamente
      mutate(
        orders.map((o) =>
          o.id === updateDialog.order?.id
            ? { ...o, status: updateDialog.newStatus! }
            : o
        ),
        false
      )

      setUpdateDialog({ open: false, order: null, newStatus: null })
      showSuccess('✓ Estado del pedido actualizado correctamente')
    } catch (err) {
      console.error('❌ [WORKSHOP_ORDERS] Error actualizando estado:', err)

      let errorMessage = 'Error al actualizar el estado del pedido'

      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as any).response

        // El backend ahora devuelve JSON con { error, message }
        const backendMessage = response?.data?.message || response?.data?.error

        if (backendMessage) {
          // Mejorar mensajes específicos
          if (backendMessage.includes('completado') || backendMessage.includes('cancelado')) {
            errorMessage = '⚠️ Este pedido ya está en estado final y no puede ser modificado'
          } else if (backendMessage.includes('no se puede cambiar')) {
            errorMessage = `⚠️ ${backendMessage}`
          } else {
            errorMessage = backendMessage
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      showError(errorMessage)
      setError(errorMessage)
    } finally {
      setUpdateLoading(null)
    }
  }

  const handleUpdateDialogClose = () => {
    setUpdateDialog({ open: false, order: null, newStatus: null })
  }

  const formatPrice = (price: number) => `${(price / 100).toFixed(2)}€`

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getOrderTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
      PRODUCT_ORDER: 'Producto',
      SERVICE_REPAIR: 'Reparación',
      RENTAL: 'Alquiler',
    }
    return labels[type || 'PRODUCT_ORDER']
  }

  const getOrderTypeColor = (type?: string): 'default' | 'primary' | 'secondary' => {
    const colors: Record<string, 'default' | 'primary' | 'secondary'> = {
      PRODUCT_ORDER: 'default',
      SERVICE_REPAIR: 'secondary',
      RENTAL: 'primary',
    }
    return colors[type || 'PRODUCT_ORDER']
  }

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
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mb={1}
                      >
                        {order.type === 'RENTAL' ? <TwoWheeler /> : getStatusIcon(order.status)}
                        <Typography variant="h6">
                          Pedido #{order.id.slice(0, 8)}
                        </Typography>
                        <Chip
                          size="small"
                          label={getOrderTypeLabel(order.type)}
                          color={getOrderTypeColor(order.type)}
                          variant="outlined"
                        />
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
                      {/* Mostrar fechas de alquiler si es un pedido de tipo RENTAL */}
                      {order.type === 'RENTAL' && order.items && order.items.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarMonth sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {order.items[0].rentalStartDate && formatDate(order.items[0].rentalStartDate)} -{' '}
                            {order.items[0].rentalEndDate && formatDate(order.items[0].rentalEndDate)}
                            {order.items[0].rentalDays && ` (${order.items[0].rentalDays} días)`}
                          </Typography>
                        </Box>
                      )}
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
                    {order.status !== 'COMPLETED' &&
                      order.status !== 'CANCELLED' && (
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
            <Button
              onClick={handleUpdateDialogClose}
              disabled={updateLoading !== null}
            >
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
