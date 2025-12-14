import { Cancel, Receipt, ShoppingBag, Visibility } from '@mui/icons-material'
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
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import {
  cancelOrder,
  getMyOrders,
  getOrderStatusColor,
  getOrderStatusLabel,
  type Order,
  OrderStatus,
} from '../services/order-service'

export const MyOrders = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  console.log('🔐 [MYORDERS] Usuario al cargar componente:', user)
  console.log('🔐 [MYORDERS] User ID:', user?.id)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelLoading, setCancelLoading] = useState<string | null>(null)

  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean
    order: Order | null
  }>({
    open: false,
    order: null,
  })

  const loadOrders = useCallback(async () => {
    console.log('🔄 [LOADORDERS] Ejecutando loadOrders...')

    if (!user?.id) {
      return
    }

    try {
      setLoading(true)
      setError('')
      const data = await getMyOrders(user.id)
      setOrders(data)
    } catch {
      setError('Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const handleCancelClick = (order: Order) => {
    setCancelDialog({ open: true, order })
  }

  const handleCancelConfirm = async () => {
    if (!cancelDialog.order) return

    try {
      setCancelLoading(cancelDialog.order.id)
      await cancelOrder(cancelDialog.order.id)

      // Actualizar la lista local
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelDialog.order?.id
            ? { ...o, status: 'CANCELLED' as any }
            : o
        )
      )

      setCancelDialog({ open: false, order: null })
    } catch {
      setError('Error al cancelar el pedido')
    } finally {
      setCancelLoading(null)
    }
  }

  const handleCancelDialogClose = () => {
    setCancelDialog({ open: false, order: null })
  }

  const formatPrice = (price: number) => `${(price / 100).toFixed(2)}€`

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando tus pedidos...
          </Typography>
        </Box>
      </Container>
    )
  }

  console.log('🔐 Usuario en frontend:', user)
  console.log('🔐 User ID en frontend:', user?.id)

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Mis Pedidos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona y consulta el estado de tus pedidos
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
            <ShoppingBag
              sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h5" color="text.secondary">
              No tienes pedidos todavía
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
                        <Receipt />
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
                      Notas: {order.notes}
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
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleCancelClick(order)}
                        >
                          Cancelar Pedido
                        </Button>
                      )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        {/* Modal de confirmación de cancelación */}
        <Dialog
          open={cancelDialog.open}
          onClose={handleCancelDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirmar cancelación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres cancelar el pedido #
              {cancelDialog.order?.id.slice(0, 8)}?
            </DialogContentText>
            <DialogContentText sx={{ mt: 2, color: 'warning.main' }}>
              Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCancelDialogClose}
              disabled={cancelLoading !== null}
            >
              No, Mantener Pedido
            </Button>
            <Button
              onClick={handleCancelConfirm}
              color="error"
              variant="contained"
              disabled={cancelLoading !== null}
            >
              {cancelLoading ? 'Cancelando...' : 'Sí, Cancelar Pedido'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
