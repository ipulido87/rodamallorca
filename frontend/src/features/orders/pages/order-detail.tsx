import { ArrowBack, Cancel, Store, TwoWheeler, CalendarMonth } from '@mui/icons-material'
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
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR from 'swr'
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
  const [error, setError] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  // Estado para el modal de confirmación de cancelación
  const [cancelDialog, setCancelDialog] = useState(false)

  // SWR: Cargar detalle del pedido con cache
  const { data: order, isLoading: loading, mutate } = useSWR<Order>(
    orderId ? `/orders/${orderId}` : null,
    () => getOrderById(orderId!),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  )

  const handleCancelClick = () => {
    setCancelDialog(true)
  }

  const handleCancelConfirm = async () => {
    if (!order) return

    try {
      setCancelLoading(true)
      const updatedOrder = await cancelOrder(order.id)
      // Optimistic update: actualizar cache inmediatamente
      mutate(updatedOrder, false)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
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
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                {order.type === 'RENTAL' && <TwoWheeler color="primary" />}
                <Typography variant="h4" fontWeight="bold">
                  Pedido #{order.id.slice(0, 8)}
                </Typography>
                <Chip
                  label={getOrderTypeLabel(order.type)}
                  color={getOrderTypeColor(order.type)}
                  size="small"
                  variant="outlined"
                />
              </Stack>
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

        {/* Información de Alquiler (solo para pedidos tipo RENTAL) */}
        {order.type === 'RENTAL' && order.items && order.items.length > 0 && order.items[0].isRental && (
          <Card sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <CalendarMonth />
                <Typography variant="h6">
                  Información de Alquiler
                </Typography>
              </Stack>
              <Divider sx={{ mb: 2, borderColor: 'primary.dark' }} />

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Fecha de Inicio
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {order.items[0].rentalStartDate && formatDate(order.items[0].rentalStartDate)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Fecha de Devolución
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {order.items[0].rentalEndDate && formatDate(order.items[0].rentalEndDate)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Duración
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {order.items[0].rentalDays} {order.items[0].rentalDays === 1 ? 'día' : 'días'}
                  </Typography>
                </Box>

                {order.items[0].depositPaid && order.items[0].depositPaid > 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Depósito (reembolsable)
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatPrice(order.items[0].depositPaid)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

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
