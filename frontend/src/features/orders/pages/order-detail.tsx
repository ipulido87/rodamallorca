import { ArrowBack, Cancel, Store } from '@mui/icons-material'
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
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  cancelOrder,
  getOrderById,
  getOrderStatusColor,
  getOrderStatusLabel,
  type Order,
  OrderStatus,
} from '../services/order-service'

export const OrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  // Estado para el modal de confirmación de cancelación
  const [cancelDialog, setCancelDialog] = useState(false)

  const loadOrder = useCallback(async () => {
    if (!orderId) return
    try {
      setLoading(true)
      setError('')
      const data = await getOrderById(orderId)
      setOrder(data)
    } catch (e) {
      console.error('❌ [ORDER_DETAIL] Error cargando pedido:', e)
      setError('Error al cargar el pedido')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    void loadOrder()
  }, [loadOrder])

  const handleCancelClick = () => {
    setCancelDialog(true)
  }

  const handleCancelConfirm = async () => {
    if (!order) return

    try {
      setCancelLoading(true)
      const updatedOrder = await cancelOrder(order.id)
      setOrder(updatedOrder)
      setCancelDialog(false)
    } catch {
      setError('Error al cancelar el pedido')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleCancelDialogClose = () => {
    setCancelDialog(false)
  }

  const formatPrice = (price: number) => `${(price / 100).toFixed(2)}€`

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Cargando pedido...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (!order) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">Pedido no encontrado</Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/orders')}
            sx={{ mt: 2 }}
          >
            Volver a Mis Pedidos
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/orders')}
            sx={{ mb: 2 }}
          >
            Volver a Mis Pedidos
          </Button>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Pedido #{order.id.slice(0, 8)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
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
              size="medium"
            />
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Información del pedido */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información del Pedido
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Taller
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Store fontSize="small" />
                  <Typography variant="body1">
                    ID: {order.workshopId.slice(0, 8)}
                  </Typography>
                </Stack>
              </Box>

              {order.notes && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Notas
                  </Typography>
                  <Typography variant="body1">{order.notes}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Estado
                </Typography>
                <Typography variant="body1">
                  {getOrderStatusLabel(order.status)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Items del pedido */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Productos
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unitario</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.description ||
                          `Producto ${item.productId?.slice(0, 8)}`}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        {formatPrice(item.priceAtOrder)}
                      </TableCell>
                      <TableCell align="right">
                        {formatPrice(item.priceAtOrder * item.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="h6">Total</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="h6"
                        color="primary"
                        fontWeight="bold"
                      >
                        {formatPrice(order.totalAmount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Acciones */}
        {order.status !== OrderStatus.COMPLETED &&
          order.status !== OrderStatus.CANCELLED && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Acciones
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={handleCancelClick}
                >
                  Cancelar Pedido
                </Button>
              </CardContent>
            </Card>
          )}

        {/* Modal de confirmación de cancelación */}
        <Dialog
          open={cancelDialog}
          onClose={handleCancelDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirmar cancelación</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que quieres cancelar este pedido?
            </DialogContentText>
            <DialogContentText sx={{ mt: 2, color: 'warning.main' }}>
              Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelDialogClose} disabled={cancelLoading}>
              No, Mantener Pedido
            </Button>
            <Button
              onClick={handleCancelConfirm}
              color="error"
              variant="contained"
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Cancelando...' : 'Sí, Cancelar Pedido'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  )
}
